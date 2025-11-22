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
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Query\Expr\Join;

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
		$params = $operation->getParameters();

		$searchText = OperationHelper::getParameter($operation, "q");
		$originPath = OperationHelper::getParameter($operation, "originPath");
		$familyFilter = OperationHelper::getParameter($operation, "family");
		$sortParam = OperationHelper::getParameter($operation, "sort") ?? "popularity";

		$expr = $this->em->getExpressionBuilder();
		$searchQuery = $this->em->createQueryBuilder()
			->select("type.id")
			->from(\App\Entity\TeaType::class, "type")
			->groupBy("type.id");

		if (null !== $searchText) {
			$searchQuery
				->andWhere("0.1 < SIMILARITY(UNACCENT(type.name), UNACCENT(:searchText))")
				->orderBy("SIMILARITY(unaccent(type.name), unaccent(:searchText))", "DESC")
				->addGroupBy("type.name")
				->setParameter("searchText", $searchText);
		}

		if (null !== $originPath) {
			$searchQuery
				->innerJoin("type.origin", "origin", Join::WITH, "CONTAINS(:pathFilter, origin.path) = TRUE")
				->setParameter("pathFilter", $originPath);
		}

		if (null !== $familyFilter) {
			$searchQuery->andWhere("type.family = :family")->setParameter("family", $familyFilter);
		}

		// Sorting

		if ("popularity" === $sortParam) {
			$searchQuery
				->leftJoin("type.teas", "teas")
				->leftJoin("teas.sessions", "session", Join::WITH, ":popularSince <= session.drankAt")
				->addOrderBy("count(DISTINCT session.id)", "DESC")
				->setParameter("popularSince", new \DateTimeImmutable()->sub(new \DateInterval("P1M")));
		}

		$total = (clone $searchQuery)
			->select("COUNT(DISTINCT type.id)")
			->resetDQLPart("groupBy")
			->resetDQLPart("orderBy")
			->getQuery()
			->getSingleScalarResult();

		if (0 === $total) {
			return new TraversablePaginator(new ArrayCollection(), $page, $limit, $total);
		}

		$searchResults = $searchQuery
			->addOrderBy("MAX(type.createdBy)", "DESC")
			->setFirstResult($offset)
			->setMaxResults($limit)
			->getQuery()
			->getResult(AbstractQuery::HYDRATE_SCALAR_COLUMN);

		$entities = $this->em->createQuery(
			<<<DQL
			SELECT type, origin
			FROM App\Entity\TeaType type
				LEFT JOIN type.origin origin
			WHERE type.id IN (:ids)
			DQL,
		)
			->setParameter("ids", $searchResults, ArrayParameterType::INTEGER)
			->getResult();

		$entitiesById = Arr::keyBy($entities, "id");

		$namePathMap = $this->originRepo->getAncestorsNamesByPath(
			Arr::pluck($entities, fn($type) => $type->origin->id, true),
		);

		// Iterate over results (not entities) to keep ordering
		$resources = array_map(function ($typeId) use ($entitiesById, $namePathMap) {
			$type = $entitiesById[$typeId];
			$resource = TeaTypeProvider::fromEntity($type);
			$origin = $resource->origin;
			$origin->namePath = $namePathMap[$origin->path];
			return $resource;
		}, $searchResults);

		return new TraversablePaginator(new ArrayCollection($resources), $page, $limit, $total);
	}
}
