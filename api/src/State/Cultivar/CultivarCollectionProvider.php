<?php

namespace App\State\Cultivar;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\Pagination\Pagination;
use ApiPlatform\State\Pagination\PaginatorInterface;
use ApiPlatform\State\Pagination\TraversablePaginator;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Cultivar;
use App\Helper\Arr;
use App\Helper\OperationHelper;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @implements PaginatorInterface<Cultivar>
 */
readonly class CultivarCollectionProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Pagination $pagination,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): PaginatorInterface
	{
		assert($operation instanceof CollectionOperationInterface, "Only supports collection operations");

		// Query parameters

		$page = $this->pagination->getPage($context);
		$offset = $this->pagination->getOffset($operation, $context);
		$limit = $this->pagination->getLimit($operation, $context);

		$searchText = OperationHelper::getParameter($operation, "q");

		/*
		| --------------------------------
		| Search
		| --------------------------------
		*/

		$searchQb = $this->em->createQueryBuilder()
			->select("cultivar.id")
			->from(\App\Entity\Cultivar::class, "cultivar")
			->groupBy("cultivar.id");

		// Text search
		if (null !== $searchText) {
			$searchQb
				->andWhere("0.06 < SIMILARITY(UNACCENT(cultivar.name), UNACCENT(:searchText))")
				->setParameter("searchText", $searchText)
				->addGroupBy("cultivar.name")
				->orderBy("SIMILARITY(unaccent(cultivar.name), unaccent(:searchText))", "DESC");
		}

		$total = (clone $searchQb)
			->select("COUNT(cultivar.id)")
			->resetDQLPart("groupBy")
			->resetDQLPart("orderBy")
			->getQuery()
			->getSingleScalarResult();

		if (0 === $total) {
			return new TraversablePaginator(new ArrayCollection(), $page, $limit, $total);
		}

		$searchResults = $searchQb
			->addOrderBy("cultivar.name", "ASC")
			->setFirstResult($offset)
			->setMaxResults($limit)
			->getQuery()
			->getResult();

		/*
		| --------------------------------
		| Hydrate
		| --------------------------------
		*/

		$entitiesQuery = $this->em->createQueryBuilder()
			->select("cultivar")
			->from(\App\Entity\Cultivar::class, "cultivar")
			->where("cultivar.id IN (:ids)")
			->setParameter("ids", Arr::pluck($searchResults, "id"), ArrayParameterType::INTEGER);

		$resources = array_map(
			fn(\App\Entity\Cultivar $cultivar) => CultivarProvider::fromEntity($cultivar),
			$entitiesQuery->getQuery()->getResult(),
		);

		return new TraversablePaginator(new ArrayCollection($resources), $page, $limit, $total);
	}
}
