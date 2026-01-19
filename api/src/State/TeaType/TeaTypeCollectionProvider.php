<?php

namespace App\State\TeaType;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\Pagination\Pagination;
use ApiPlatform\State\Pagination\PaginatorInterface;
use ApiPlatform\State\Pagination\TraversablePaginator;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\TeaType;
use App\Helper\Arr;
use App\Helper\OperationHelper;
use App\Repository\OriginRepository;
use App\State\Origin\OriginProvider;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @implements ProviderInterface<TeaType[]>
 */
readonly class TeaTypeCollectionProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private OriginRepository $originRepo,
		private Pagination $pagination,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): PaginatorInterface
	{
		assert($operation instanceof CollectionOperationInterface);

		// Query parameters
		$page = $this->pagination->getPage($context);
		$offset = $this->pagination->getOffset($operation, $context);
		$limit = $this->pagination->getLimit($operation, $context);

		$searchText = OperationHelper::getParameter($operation, "q");
		$originPath = OperationHelper::getParameter($operation, "originPath");
		$familyFilter = OperationHelper::getParameter($operation, "family");
		$sortParam = OperationHelper::getParameter($operation, "sort") ?? "popularity";

		$expr = $this->em->getExpressionBuilder();
		$searchQuery = $this->em->createQueryBuilder()
			->select("type.id AS typeId", "origin.id AS originId")
			->from(\App\Entity\Tea::class, "tea")
			->leftJoin("tea.type", "type")
			->groupBy("type.id", "origin.id");

		if (null !== $searchText) {
			$searchQuery
				->andWhere("0.1 < SIMILARITY(UNACCENT(type.name), UNACCENT(:searchText))")
				->orderBy("SIMILARITY(UNACCENT(any_value(type.name)), UNACCENT(:searchText))", "DESC")
				->setParameter("searchText", $searchText);
		}

		if (null !== $originPath) {
			$searchQuery
				->innerJoin("tea.origin", "origin", "WITH", "CONTAINS(:pathFilter, origin.path) = TRUE")
				->setParameter("pathFilter", $originPath);
		} else {
			$searchQuery
				->leftJoin(\App\Entity\Origin::class, "origin", "WITH", "SUBPATH(tea.originPath, 0, 1) = origin.path");
		}

		if (null !== $familyFilter) {
			$searchQuery->andWhere("type.family = :family")->setParameter("family", $familyFilter);
		}

		// Sorting

		if ("popularity" === $sortParam) {
			$searchQuery
				->leftJoin("tea.sessions", "session", "WITH", ":popularSince <= session.drankAt")
				->addOrderBy("count(DISTINCT session.id)", "DESC")
				->addOrderBy("count(DISTINCT tea.id)", "DESC")
				->setParameter("popularSince", new \DateTimeImmutable()->sub(new \DateInterval("P1M")));
		}

		/*
		| --------------------------------
		| Find total results
		| --------------------------------
		*/

		// Fix: use 'concat' workaround as Doctrine doesn't allow subqueries
		//   and the '?' operator is mistaken as a prepared parameter
		$total = (clone $searchQuery)
			->select("COUNT(DISTINCT CONCAT(type.id, '-', origin.id))")
			->resetDQLPart("orderBy")
			->resetDQLPart("groupBy")
			->getQuery()
			->getSingleScalarResult();

		if (0 === $total) {
			return new TraversablePaginator(new ArrayCollection(), $page, $limit, $total);
		}

		$searchResults = $searchQuery
			->addOrderBy("MAX(type.createdAt)", "DESC")
			->setFirstResult($offset)
			->setMaxResults($limit)
			->getQuery()
			->getResult(AbstractQuery::HYDRATE_SCALAR);

		$typeIds = Arr::pluck($searchResults, "typeId", true);
		$originIds = Arr::pluck($searchResults, "originId", true);

		$entities = $this->em->createQuery(
			<<<DQL
			SELECT type, origin
			FROM App\Entity\TeaType type
				LEFT JOIN type.origin origin
			WHERE type.id IN (:ids)
			DQL,
		)
			->setParameter("ids", $typeIds, ArrayParameterType::INTEGER)
			->getResult();

		$entitiesById = Arr::keyBy($entities, "id");

		$origins = $this->originRepo->findManyWithAncestorNames($originIds);
		$origins = Arr::keyBy($origins, "id");

		// Iterate over results (not entities) to keep ordering
		$resources = array_map(function ($result) use ($entitiesById, $origins) {
			$type = $entitiesById[$result["typeId"]];
			$resource = TeaTypeProvider::fromEntity($type);
			$origin = $origins[$result["originId"]] ?? null;

			if (null !== $origin) {
				$resource->origin = OriginProvider::fromEntity($origin);
			}

			return $resource;
		}, $searchResults);

		return new TraversablePaginator(new ArrayCollection($resources), $page, $limit, $total);
	}
}
