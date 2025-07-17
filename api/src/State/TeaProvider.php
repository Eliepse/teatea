<?php

namespace App\State;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Tea;
use App\DTO\OriginPath;
use App\Entity\Origin;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @implements ProviderInterface<Tea|null>
 */
readonly class TeaProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
	{
		$isCollection = $operation instanceof CollectionOperationInterface;
		$expr = $this->em->getExpressionBuilder();

		$teaQb = $this->em->createQueryBuilder()
			->select("tea", "type", "origin")
			->from(\App\Entity\Tea::class, "tea")
			->leftJoin("tea.type", "type")
			->leftJoin("tea.origin", "origin");

		if(false === $isCollection) {
			$teaQb
				->andWhere("tea.id = :teaId")
				->setParameter("teaId", $uriVariables["id"])
				->setMaxResults(1);
		}

		/** @var array<\App\Entity\Tea> $teaEntities */
		$teaEntities = $teaQb->getQuery()->getResult();

		$originsQb = $this->em->createQueryBuilder()
			->select("origin")
			->from(Origin::class, "origin");
		//->leftJoin(Origin::class, "origins", Join::WITH, "ltree(origins.path, >, origin.path) = true")
		//->innerJoin("origin.teas", "teas")
		//->where($expr->in("teas.id", array_map(fn($e) => $e->id, $teaEntities)));

		/** @var array<string, Origin> $originsMap */
		$originsMap = array_reduce($originsQb->getQuery()->getResult(), function ($map, Origin $o) {
			$map[(string)$o->path] = $o;
			return $map;
		}, []);

		$resources = [];

		foreach ($teaEntities as $teaEntity) {
			$originNodes = OriginPath::fromNodes($this->getOriginPath($originsMap, $teaEntity->origin));
			$resources[] = $this->hydrateResource($teaEntity, $originNodes);
		}

		return $isCollection ? $resources : ($resources[0] ?? null);
	}

	/**
	 * @param array<int, Origin> $originsMap
	 * @param Origin|null $leaf
	 *
	 * @return array<Origin>
	 */
	private function getOriginPath(array $originsMap, ?Origin $leaf): array
	{
		if (null === $leaf) {
			return [];
		}

		$originNodes = [];

		$nodes = $leaf->path->getNodes();

		for ($i = 1; $i < count($nodes); $i++) {
			$path = join(".", array_slice($nodes, 0, $i));
			$originNodes[] = $originsMap[$path];
		}

		$originNodes[] = $leaf;

		return $originNodes;
	}

	private function hydrateResource(\App\Entity\Tea $entity, ?OriginPath $originPath): Tea
	{
		$tea = new Tea();
		$tea->family = $entity->family;
		$tea->id = $entity->id;
		$tea->type = TeaTypeProvider::fromEntity($entity->type);
		$tea->originPath = $originPath;
		$tea->addedAt = $entity->createdAt;

		return $tea;
	}
}
