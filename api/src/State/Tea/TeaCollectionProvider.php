<?php

namespace App\State\Tea;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\Pagination\Pagination;
use ApiPlatform\State\Pagination\PaginatorInterface;
use ApiPlatform\State\Pagination\TraversablePaginator;
use ApiPlatform\State\ProviderInterface;
use App\Entity\Origin;
use App\Helper\Arr;
use App\Helper\OperationHelper;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

/**
 * @implements ProviderInterface<PaginatorInterface|null>
 */
readonly class TeaCollectionProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private LoggerInterface $logger,
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
		$originPath = OperationHelper::getParameter($operation, "origin");
		$familyFilter = OperationHelper::getParameter($operation, "family");
		$typeFilter = OperationHelper::getParameter($operation, "type");
		$yearFilter = OperationHelper::getParameter($operation, "year", castFn: "intval");
		$cultivarFilter = OperationHelper::getParameter($operation, "cultivar", castFn: "intval");
		$businessFilter = OperationHelper::getParameter($operation, "business", castFn: "intval");
		$sortParam = OperationHelper::getParameter($operation, "sort") ?? "popularity";
		$exactMatch = OperationHelper::getParameter($operation, "exactMatch", "boolval") ?? false;

		// Ignore some filters when using tea type filter
		// as a type already have some predefined constraints
		if (null !== $typeFilter) {
			$searchText = null;
			$familyFilter = null;
		}

		/*
		 | --------------------------------
		 | Search
		 | --------------------------------
		 */

		$expr = $this->em->getExpressionBuilder();
		$searchQb = $this->em
			->createQueryBuilder()
			->select("tea.id")
			->from(\App\Entity\Tea::class, "tea")
			->leftJoin("tea.type", "type")
			->groupBy("tea.id");

		// Text search
		if (null !== $searchText && false === $exactMatch) {
			$searchQb
				->andWhere("0.1 < SIMILARITY(UNACCENT(type.name), UNACCENT(:searchText))")
				->setParameter("searchText", $searchText)
				->addGroupBy("type.name")
				->orderBy("SIMILARITY(unaccent(type.name), unaccent(:searchText))", "DESC");
		}

		// Family
		// No need to force on exactMatch mode to prevent looking for NULL values
		// (when looking for type, the family search parameter is forced to NULL)
		if (null !== $familyFilter) {
			$searchQb->andWhere("tea.family = :family")->setParameter("family", $familyFilter);
		}

		// Origin
		if (null !== $originPath && false === $exactMatch) {
			$searchQb->andWhere("CONTAINS(:originPath, tea.originPath) = TRUE")->setParameter("originPath", $originPath);
		} elseif ($exactMatch && null !== $originPath) {
			$searchQb->andWhere("tea.originPath = :originPath")->setParameter("originPath", $originPath);
		} elseif ($exactMatch && null === $originPath) {
			$searchQb->andWhere("tea.originPath IS NULL");
		}

		// Type
		if (null !== $typeFilter) {
			$searchQb->andWhere("type.slug = :typeSlug")->setParameter("typeSlug", $typeFilter);
		} elseif ($exactMatch) {
			$searchQb->andWhere("type.slug IS NULL");
		}

		// Cultivar
		if (null !== $cultivarFilter) {
			$searchQb
				->leftJoin("tea.cultivar", "cultivar")
				->andWhere("cultivar.id = :cultivarId")
				->setParameter("cultivarId", $cultivarFilter);
		} elseif ($exactMatch) {
			$searchQb
				->leftJoin("tea.cultivar", "cultivar")
				->andWhere("cultivar.id IS NULL");
		}

		// Business
		if ($businessFilter) {
			$searchQb
				->leftJoin("tea.business", "business")
				->andWhere("business.id = :businessId")
				->setParameter("businessId", $businessFilter);
		} elseif($exactMatch) {
			$searchQb
				->leftJoin("tea.business", "business")
				->andWhere("business.id IS NULL");
		}

		// Yaer
		if (is_int($yearFilter)) {
			$searchQb->andWhere("tea.year = :year")->setParameter("year", $yearFilter);
		} elseif($exactMatch) {
			$searchQb->andWhere("tea.year IS NULL");
		}

		// Sorting

		if ("popularity" === $sortParam) {
			$searchQb->leftJoin("tea.sessions", "session", "WITH", ":popularSince <= session.drankAt")->setParameter(
				"popularSince",
				new \DateTimeImmutable()->sub(new \DateInterval("P1M")),
			);

			$searchQb->addOrderBy("count(session.id)", "DESC");
		}

		$total = (clone $searchQb)
			->select("COUNT(DISTINCT tea.id)")
			->resetDQLPart("groupBy")
			->resetDQLPart("orderBy")
			->getQuery()
			->getSingleScalarResult();

		if (0 === $total) {
			return new TraversablePaginator(new ArrayCollection(), $page, $limit, $total);
		}

		$searchResults = $searchQb
			->addOrderBy("tea.createdAt", "DESC")
			->setFirstResult($offset)
			->setMaxResults($limit)
			->getQuery()
			->getResult();

		/*
		 | --------------------------------
		 | Hydrate
		 | --------------------------------
		 */

		/** @var array<\App\Entity\Tea> $teaEntities */
		$teaEntities = $this->em
			->createQueryBuilder()
			->select("tea", "type", "origin", "cultivar", "business")
			->from(\App\Entity\Tea::class, "tea")
			->leftJoin("tea.origin", "origin")
			->leftJoin("tea.type", "type")
			->leftJoin("tea.cultivar", "cultivar")
			->leftJoin("tea.business", "business")
			->where("tea.id IN (:ids)")
			->setParameter("ids", Arr::pluck($searchResults, "id"), ArrayParameterType::INTEGER)
			->getQuery()
			->getResult();

		/** @var array<integer, \App\Entity\Tea> $teaEntitiesById */
		$teaEntitiesById = Arr::keyBy($teaEntities, "id");

		$originsQb = $this->em
			->createQueryBuilder()
			->select("origin")
			->from(Origin::class, "origin");

		/** @var array<string, Origin> $originsMap */
		$originsMap = TeaProvider::originsToMap($originsQb->getQuery()->getResult());

		$resources = [];

		// Iterate over search results to keep the right ordering
		foreach ($searchResults as $searchResult) {
			$tea = $teaEntitiesById[$searchResult["id"]] ?? null;

			if (null === $tea) {
				$this->logger->warning("Couldn't hydrate a tea: not found in list", ["teaId" => $searchResult["id"]]);
				continue;
			}

			$originNodes = TeaProvider::getOriginPath($originsMap, $tea->origin);
			$resources[] = TeaProvider::hydrateResource($tea, $originNodes);
		}

		return new TraversablePaginator(new ArrayCollection($resources), $page, $limit, $total);
	}
}
