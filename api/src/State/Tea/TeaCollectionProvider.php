<?php

namespace App\State\Tea;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\Pagination\Pagination;
use ApiPlatform\State\Pagination\PaginatorInterface;
use ApiPlatform\State\Pagination\TraversablePaginator;
use ApiPlatform\State\ParameterNotFound;
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
		$params = $operation->getParameters();

		$searchText = $params->get("q")->getValue();
		$searchText = $searchText instanceof ParameterNotFound ? null : trim($searchText);
		$searchText = empty($searchText) ? null : $searchText;
		$originPath = $params->get("originPath")->getValue();
		$originPath = $originPath instanceof ParameterNotFound ? null : $originPath;
		$familyFilter = OperationHelper::getParameter($operation, "family");

		$sortParam = $params->get("sort")->getValue();
		if ($sortParam instanceof ParameterNotFound) {
			$sortParam = "popularity";
		}

		/*
		| --------------------------------
		| Search
		| --------------------------------
		*/

		$expr = $this->em->getExpressionBuilder();
		$searchQb = $this->em->createQueryBuilder()
			->select("tea.id")
			->from(\App\Entity\Tea::class, "tea")
			->leftJoin("tea.type", "type")
			->groupBy("tea.id");

		// Text search
		if (null !== $searchText) {
			$searchQb
				->andWhere("0.1 < SIMILARITY(UNACCENT(type.name), UNACCENT(:searchText))")
				->setParameter("searchText", $searchText)
				->addGroupBy("type.name")
				->orderBy("SIMILARITY(unaccent(type.name), unaccent(:searchText))", "DESC");
		}

		// Family
		if (null !== $familyFilter) {
			$searchQb->andWhere("tea.family = :family")->setParameter("family", $familyFilter);
		}

		// Origin
		if (false === empty($originPath)) {
			$searchQb
				->innerJoin("tea.origin", "origin", "WITH", "CONTAINS(:originPath, origin.path) = TRUE")
				->setParameter("originPath", $originPath);
		}

		// Sorting

		if ("popularity" === $sortParam) {
			$searchQb
				->leftJoin("tea.sessions", "session", "WITH", ":popularSince <= session.drankAt")
				->setParameter("popularSince", new \DateTimeImmutable()->sub(new \DateInterval("P1M")));

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
			->addOrderBy("tea.createdBy", "DESC")
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
		$teaEntities = $this->em->createQueryBuilder()
			->select("tea", "type", "origin", "cultivar")
			->from(\App\Entity\Tea::class, "tea")
			->leftJoin("tea.origin", "origin")
			->leftJoin("tea.type", "type")
			->leftJoin("tea.cultivar", "cultivar")
			->where("tea.id IN (:ids)")
			->setParameter("ids", Arr::pluck($searchResults, "id"), ArrayParameterType::INTEGER)
			->getQuery()
			->getResult();

		/** @var array<integer, \App\Entity\Tea> $teaEntitiesById */
		$teaEntitiesById = Arr::keyBy($teaEntities, "id");

		$originsQb = $this->em->createQueryBuilder()
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
