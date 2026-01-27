<?php

namespace App\State\Tea;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Tea;
use App\DTO\OriginPath;
use App\Entity\Origin;
use App\State\Cultivar\CultivarProvider;
use App\State\Origin\OriginProvider;
use App\State\TeaType\TeaTypeProvider;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\Proxy;

/**
 * @implements ProviderInterface<Tea|null>
 */
readonly class TeaProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
	) {}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): ?Tea
	{
		assert(false === $operation instanceof CollectionOperationInterface, "Collection operation not supported");

		$teaQb = $this->em
			->createQueryBuilder()
			->select("tea", "type", "origin", "cultivar")
			->from(\App\Entity\Tea::class, "tea")
			->leftJoin("tea.type", "type")
			->leftJoin("tea.origin", "origin")
			->leftJoin("tea.cultivar", "cultivar")
			->andWhere("tea.id = :teaId")
			->setParameter("teaId", $uriVariables["id"]);

		/** @var \App\Entity\Tea|null $teaEntity */
		$teaEntity = $teaQb->getQuery()->getOneOrNullResult();

		if (null === $teaEntity) {
			return null;
		}

		$originsQb = $this->em
			->createQueryBuilder()
			->select("origin")
			->from(Origin::class, "origin");

		/** @var array<string, Origin> $originsMap */
		$originsMap = self::originsToMap($originsQb->getQuery()->getResult());
		$originNodes = self::getOriginPath($originsMap, $teaEntity->origin);
		return self::hydrateResource($teaEntity, $originNodes);
	}

	/**
	 * @param array<Origin> $origins
	 *
	 * @return array<string, Origin>
	 */
	public static function originsToMap(array $origins): array
	{
		return array_reduce(
			$origins,
			function ($map, Origin $o) {
				$map[(string) $o->path] = $o;
				return $map;
			},
			[],
		);
	}

	/**
	 * @param array<int, Origin> $originsMap
	 * @param Origin|null $leaf
	 *
	 * @return OriginPath|null
	 */
	public static function getOriginPath(array $originsMap, ?Origin $leaf): ?OriginPath
	{
		if (null === $leaf) {
			return null;
		}

		$originNodes = [];

		$nodes = $leaf->path->getNodes();

		for ($i = 1; $i < count($nodes); $i++) {
			$path = join(".", array_slice($nodes, 0, $i));
			$originNodes[] = OriginProvider::fromEntity($originsMap[$path]);
		}

		$originNodes[] = OriginProvider::fromEntity($leaf);

		return OriginPath::fromNodes($originNodes);
	}

	public static function hydrateResource(\App\Entity\Tea $entity, ?OriginPath $originPath = null): Tea
	{
		$tea = new Tea();
		$tea->family = $entity->family;
		$tea->id = $entity->id;
		$tea->type = TeaTypeProvider::fromEntity($entity->type);

		$tea->originPath = $originPath;
		if (null !== $entity->origin && false === $entity->origin instanceof Proxy) {
			$tea->origin = OriginProvider::fromEntity($entity->origin);
		}

		$tea->cultivar = CultivarProvider::fromEntity($entity->cultivar);
		$tea->year = $entity->year;
		$tea->roast = $entity->roast;
		$tea->addedAt = $entity->createdAt;

		return $tea;
	}
}
