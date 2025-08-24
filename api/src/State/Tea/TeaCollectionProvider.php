<?php

namespace App\State\Tea;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ParameterNotFound;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Tea;
use App\Entity\Origin;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @implements ProviderInterface<Tea|null>
 */
readonly class TeaCollectionProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
	{
		assert($operation instanceof CollectionOperationInterface, "Only supports collection operations");

		// Query parameters

		$params = $operation->getParameters();

		$searchTextParam = $params->get("q")->getValue();
		$hasSearchText = false === ($searchTextParam instanceof ParameterNotFound);

		$sortParam = $params->get("sort")->getValue();
		if ($sortParam instanceof ParameterNotFound) {
			$sortParam = "popularity";
		}

		// Base query

		$teaQb = $this->em->createQueryBuilder()
			->select("tea", "type", "origin")
			->from(\App\Entity\Tea::class, "tea")
			->leftJoin("tea.origin", "origin")
			->leftJoin("tea.type", "type")
			->groupBy("tea.id", "tea.createdBy", "type.id", "origin.id");

		// Search

		if ($hasSearchText) {
			$teaQb
				->andWhere("0.1 < SIMILARITY(UNACCENT(type.name), UNACCENT(:searchText))")
				->setParameter("searchText", $searchTextParam);
		}

		// Sorting

		if ("popularity" === $sortParam) {
			$teaQb->leftJoin("tea.drinks", "drink", "WITH", ":popularSince <= drink.drankAt")
				->setParameter("popularSince", new \DateTimeImmutable()->sub(new \DateInterval("P1M")));

			if ($hasSearchText) {
				$teaQb->orderBy(
					"ROW_NUMBER(ORDER BY SIMILARITY(unaccent(type.name), unaccent(':searchText')) DESC, count(drink.id) DESC)",
				);
			} else {
				$teaQb->orderBy("count(drink.id)", "DESC");
			}
		}

		/** @var array<\App\Entity\Tea> $teaEntities */
		$teaEntities = $teaQb
			->addOrderBy("tea.createdBy", "DESC")
			->getQuery()
			->getResult();

		$originsQb = $this->em->createQueryBuilder()
			->select("origin")
			->from(Origin::class, "origin");

		/** @var array<string, Origin> $originsMap */
		$originsMap = TeaProvider::originsToMap($originsQb->getQuery()->getResult());

		$resources = [];

		foreach ($teaEntities as $teaEntity) {
			$originNodes = TeaProvider::getOriginPath($originsMap, $teaEntity->origin);
			$resources[] = TeaProvider::hydrateResource($teaEntity, $originNodes);
		}

		return $resources;
	}
}
