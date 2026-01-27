<?php

namespace App\State\Business;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\Pagination\Pagination;
use ApiPlatform\State\Pagination\PaginatorInterface;
use ApiPlatform\State\Pagination\TraversablePaginator;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Business;
use App\Helper\OperationHelper;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @implements ProviderInterface<PaginatorInterface<Business>|null>
 */
readonly class BusinessPaginatedProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Pagination $pagination,
	) {}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): PaginatorInterface
	{
		assert($operation instanceof CollectionOperationInterface);

		$page = $this->pagination->getPage($context);
		$pageSize = $this->pagination->getLimit($operation, $context);

		$search = $this->em->createQueryBuilder()->from(\App\Entity\Business::class, "business");

		// Text search
		$searchText = OperationHelper::getParameter($operation, "q");
		if (is_string($searchText)) {
			$search
				->andWhere("0.05 < SIMILARITY(UNACCENT(business.name), UNACCENT(:searchText))")
				->orderBy("SIMILARITY(unaccent(business.name), unaccent(:searchText))", "DESC")
				->setParameter("searchText", $searchText);
		}

		$total = (clone $search)->select("COUNT(business)")->resetDQLPart("orderBy")->getQuery()->getSingleScalarResult();

		if (0 === $total) {
			return new TraversablePaginator(new ArrayCollection(), $page, $pageSize, $total);
		}

		$results = $search
			->select("business")
			->setFirstResult($this->pagination->getOffset($operation, $context))
			->setMaxResults($pageSize)
			->getQuery()
			->getResult();

		$resources = array_map(fn($e) => BusinessProvider::fromEntity($e), $results);
		return new TraversablePaginator(new ArrayCollection($resources), $page, $pageSize, $total);
	}
}
