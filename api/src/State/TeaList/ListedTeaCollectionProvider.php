<?php

namespace App\State\TeaList;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ParameterNotFound;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Tea;
use App\Entity\Origin;
use App\Helper\Arr;
use App\Helper\OperationHelper;
use App\State\Tea\TeaProvider;
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

/**
 * @implements ProviderInterface<Tea|null>
 */
readonly class ListedTeaCollectionProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private LoggerInterface $logger,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): array
	{
		assert($operation instanceof CollectionOperationInterface, "Only supports collection operations");

		dd($uriVariables);

		// Query parameters

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
				->orderBy(
					"SIMILARITY(unaccent(type.name), unaccent(':searchText'))",
//					"ROW_NUMBER(ORDER BY SIMILARITY(unaccent(type.name), unaccent(':searchText')) DESC)",
				);
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

		$searchResults = $searchQb
			->addOrderBy("tea.createdBy", "DESC")
			->getQuery()
			->getResult();

		if (0 === count($searchResults)) {
			return [];
		}

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

		return $resources;
	}
}
