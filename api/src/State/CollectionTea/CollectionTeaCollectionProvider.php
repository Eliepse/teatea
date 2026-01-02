<?php

namespace App\State\CollectionTea;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\Pagination\Pagination;
use ApiPlatform\State\Pagination\PaginatorInterface;
use ApiPlatform\State\Pagination\TraversablePaginator;
use ApiPlatform\State\ProviderInterface;
use App\Entity\CollectionTea;
use App\Helper\Arr;
use App\Helper\OperationHelper;
use App\Repository\OriginRepository;
use App\State\Hydration\CollectionTeaHydrator;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

/**
 * @implements ProviderInterface<PaginatorInterface|null>
 */
readonly class CollectionTeaCollectionProvider implements ProviderInterface
{
	public function __construct(
		private OriginRepository $originRepo,
		private EntityManagerInterface $em,
		private LoggerInterface $logger,
		private Pagination $pagination,
		private CollectionTeaHydrator $hydrator,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): PaginatorInterface
	{
		assert($operation instanceof CollectionOperationInterface, "Only supports collection operations");
		assert(false === empty($uriVariables["username"]));

		// Query parameters

		$page = $this->pagination->getPage($context);
		$offset = $this->pagination->getOffset($operation, $context);
		$limit = $this->pagination->getLimit($operation, $context);

		$familyFilter = OperationHelper::getParameter($operation, "family");
//		$sortParam = OperationHelper::getParameter($operation, "sort") ?? "popularity";

		/*
		| --------------------------------
		| Search
		| --------------------------------
		*/

		$expr = $this->em->getExpressionBuilder();
		$searchQb = $this->em->createQueryBuilder()
			->select("collection_tea.id")
			->from(\App\Entity\CollectionTea::class, "collection_tea")
			->innerJoin("collection_tea.owner", "owner")
			->where("owner.username = :username")->setParameter("username", $uriVariables["username"])
			->groupBy("collection_tea.id", "collection_tea.createdAt")
			->orderBy("collection_tea.createdAt", "DESC");

		// Family
		if (null !== $familyFilter) {
			$searchQb
				->innerJoin("collection_tea.tea", "tea")
				->andWhere("tea.family = :family")
				->setParameter("family", $familyFilter);
		}

		// Sorting

//		if ("popularity" === $sortParam) {
//			$searchQb
//				->leftJoin("tea.sessions", "session", "WITH", ":popularSince <= session.drankAt")
//				->setParameter("popularSince", new \DateTimeImmutable()->sub(new \DateInterval("P1M")));
//
//			$searchQb->addOrderBy("count(session.id)", "DESC");
//		}

		$total = (clone $searchQb)
			->select("COUNT(collection_tea.id)")
			->resetDQLPart("groupBy")
			->resetDQLPart("orderBy")
			->getQuery()
			->getSingleScalarResult();

		if (0 === $total) {
			return new TraversablePaginator(new ArrayCollection(), $page, $limit, $total);
		}

		$searchResults = $searchQb
//			->addOrderBy("collection_tea.createdAt", "DESC")
			->setFirstResult($offset)
			->setMaxResults($limit)
			->getQuery()
			->getResult();

		/*
		| --------------------------------
		| Hydrate
		| --------------------------------
		*/

		/** @var array<\App\Entity\CollectionTea> $entities */
		$entities = $this->em->createQueryBuilder()
			->select("collection_tea", "tea", "type", "cultivar")
			->from(\App\Entity\CollectionTea::class, "collection_tea")
			->leftJoin("collection_tea.tea", "tea")
			->leftJoin("tea.type", "type")
			->leftJoin("tea.cultivar", "cultivar")
			->where("collection_tea.id IN (:ids)")
			->setParameter("ids", Arr::pluck($searchResults, "id"), ArrayParameterType::INTEGER)
			->getQuery()
			->getResult();

		/** @var array<integer, \App\Entity\Tea> $entitiesById */
		$entitiesById = Arr::keyBy($entities, "id");

		/** @var array<integer, \App\Entity\Origin> $entitiesById */
		$originsById = Arr::keyBy(
			$this->originRepo->findManyWithAncestorNames(
				array_filter(Arr::pluck($entities, fn($e) => $e->tea->origin?->id, true)),
			),
			"id",
		);

		$resources = [];

		// Iterate over search results to keep the right ordering
		foreach ($searchResults as $searchResult) {
			$id = $searchResult["id"];
			/** @var CollectionTea $collectionTea */
			$collectionTea = $entitiesById[$id] ?? null;

			if (null === $collectionTea) {
				$this->logger->warning("Couldn't hydrate a collection tea: not found in list", ["collectionTea" => $id],
				);
				continue;
			}

			if (null !== $collectionTea->tea->origin) {
				$collectionTea->tea->origin = $originsById[$collectionTea->tea->origin->id];
			}

			$resources[] = $this->hydrator->hydrate($collectionTea);
		}

		return new TraversablePaginator(new ArrayCollection($resources), $page, $limit, $total);
	}
}
