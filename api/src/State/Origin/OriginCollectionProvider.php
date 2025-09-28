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

		// Filter by parent
		$parentPath = $this->getParameter($operation, "parent");
		if (is_string($parentPath)) {
			$originQb
				->andWhere("IS_CONTAINED_BY(origin.path, :parentPath) = TRUE")
				->setParameter("parentPath", $parentPath);
		}

		// Filter by level
		$level = $this->getParameter($operation, "level");
		if (is_int($level)) {
			$originQb
				->andWhere("NLEVEL(origin.path) = :nlevel")
				->setParameter("nlevel", $level);
		}

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

	private function getParameter(Operation $operation, string $key): mixed
	{
		$parameter = $operation->getParameters()?->get($key);

		if (null === $parameter) {
			return null;
		}

		$value = $parameter->getValue();
		return $value instanceof ParameterNotFound ? null : $value;
	}
}
