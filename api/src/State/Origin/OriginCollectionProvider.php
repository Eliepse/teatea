<?php

namespace App\State\Origin;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ParameterNotFound;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Origin;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @implements ProviderInterface<Origin|null>
 */
readonly class OriginCollectionProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): Origin|array|null
	{
		assert($operation instanceof CollectionOperationInterface);

		$originQb = $this->em->createQueryBuilder()
			->select("origin", "COUNT(child) as children")
			->from(\App\Entity\Origin::class, "origin")
			->leftJoin(
				\App\Entity\Origin::class,
				"child",
				"WITH",
				"child.id != origin.id AND IS_CONTAINED_BY(child.path, origin.path) = TRUE",
			)
			->groupBy("origin")
			->orderBy("origin.path", "ASC");

		return array_map(
			function ($row) {
				$entity = $row[0];
				$resource = OriginProvider::fromEntity($entity);
				$resource->isLeaf = empty($row["children"]);
				return $resource;
			},
			$originQb->getQuery()->getResult(),
		);
	}
}
