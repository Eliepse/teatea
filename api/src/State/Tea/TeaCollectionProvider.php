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
		$params = $operation->getParameters();
		$searchText = $params->get("q")->getValue();

		$teaQb = $this->em->createQueryBuilder()
			->select("tea", "type", "origin")
			->from(\App\Entity\Tea::class, "tea")
			->leftJoin("tea.type", "type")
			->leftJoin("tea.origin", "origin");

		if (false === ($searchText instanceof ParameterNotFound)) {
			$teaQb
				->setParameter("searchText", $searchText)
				->andWhere("0.1 < SIMILARITY(UNACCENT(type.name), UNACCENT(:searchText))")
				->addOrderBy("SIMILARITY(UNACCENT(type.name), UNACCENT(:searchText))", "DESC");
		}

		/** @var array<\App\Entity\Tea> $teaEntities */
		$teaEntities = $teaQb->getQuery()->getResult();

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
