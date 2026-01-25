<?php

namespace App\State\TeaType;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\Pagination\Pagination;
use ApiPlatform\State\Pagination\PaginatorInterface;
use ApiPlatform\State\Pagination\TraversablePaginator;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\TeaType;
use App\Doctrine\DBAL\Types\ValueObject\LTreePath;
use App\Entity\Origin as OriginEntity;
use App\Helper\Arr;
use App\Helper\OperationHelper;
use App\Repository\OriginRepository;
use App\State\Origin\OriginProvider;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

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
		$familyFilter = OperationHelper::getParameter($operation, "family");
		$originFilter = OperationHelper::getParameter($operation, "origin");
		$originFilter = $originFilter ? LTreePath::fromString($originFilter) : null;
		$distinctByLevelFilter = OperationHelper::getParameter($operation, "distinctByLevel");
		$noFamilyFilter = OperationHelper::getParameter($operation, "noFamily");
		$sortParam = OperationHelper::getParameter($operation, "sort") ?? "popularity";

		if ($distinctByLevelFilter && $originFilter && $distinctByLevelFilter < $originFilter->level()) {
			throw new BadRequestHttpException(
				"The 'groupByLevel' filter cannot be lower that the level of the 'origin' filter",
			);
		}
		$expr = $this->em->getExpressionBuilder();
		$searchQuery = $this->em->createQueryBuilder()
			->select("type.id AS typeId")
			->from(\App\Entity\Tea::class, "tea")
			->leftJoin("tea.type", "type")
			->groupBy("type.id");

		if (null !== $searchText) {
			$searchQuery
				->andWhere("0.1 < SIMILARITY(UNACCENT(type.name), UNACCENT(:searchText))")
				->orderBy("SIMILARITY(UNACCENT(any_value(type.name)), UNACCENT(:searchText))", "DESC")
				->setParameter("searchText", $searchText);
		}

		if (null !== $familyFilter) {
			$searchQuery->andWhere("type.family = :family")->setParameter("family", $familyFilter);
		}

		if (null !== $originFilter) {
			$searchQuery
				->andWhere("CONTAINS(:pathFilter, tea.originPath) = TRUE")
				->setParameter("pathFilter", $originFilter);
		}

		if (null !== $distinctByLevelFilter) {
			$searchQuery
				->addSelect("SUBPATH(tea.originPath, 0, :level) AS originPath")
				->setParameter("level", $distinctByLevelFilter)
				->addGroupBy("originPath");
		}

		if($noFamilyFilter) {
			$searchQuery->andWhere("type.isFamily = FALSE");
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
		$totalQuery = (clone $searchQuery)->resetDQLPart("orderBy")->resetDQLPart("groupBy");

		if (null !== $distinctByLevelFilter) {
			$totalQuery->select("COUNT(DISTINCT CONCAT(type.id, '-', SUBPATH(tea.originPath, 0, :level)))");
		} else {
			$totalQuery->select("COUNT(DISTINCT CONCAT(type.id, '-', tea.originPath))");
		}

		$total = $totalQuery->getQuery()->getSingleScalarResult();

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
		$originPaths = array_filter(Arr::pluck($searchResults, fn($row) => $row["originPath"] ?? null, true));

		$entities = $this->em
			->createQuery("SELECT type FROM App\Entity\TeaType type WHERE type.id IN (:ids)")
			->setParameter("ids", $typeIds, ArrayParameterType::INTEGER)
			->getResult();

		$entitiesById = Arr::keyBy($entities, "id");

		$origins = empty($originPaths) ? [] : $this->originRepo->findManyWithAncestorNames($originPaths);
		$origins = Arr::keyBy($origins, fn(OriginEntity $o) => $o->path->getPath());

		// Iterate over results (not entities) to keep ordering
		$resources = array_map(function ($result) use ($entitiesById, $origins) {
			$type = $entitiesById[$result["typeId"]];
			$resource = TeaTypeProvider::fromEntity($type);
			$origin = $origins[$result["originPath"] ?? null] ?? null;

			if (null !== $origin) {
				$resource->origin = OriginProvider::fromEntity($origin);
			}

			return $resource;
		}, $searchResults);

		return new TraversablePaginator(new ArrayCollection($resources), $page, $limit, $total);
	}
}
