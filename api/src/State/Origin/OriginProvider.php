<?php

namespace App\State\Origin;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Origin;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * @implements ProviderInterface<Origin|null>
 */
readonly class OriginProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): Origin|null
	{
		assert(false === ($operation instanceof CollectionOperationInterface));
		$path = $uriVariables["path"] ?? null;

		if (empty($path)) {
			throw new BadRequestHttpException();
		}

		$originQb = $this->em->createQueryBuilder()
			->select("origin", "COUNT(child) as children", "JSON_AGG(ancestors.name) as namePath")
			->from(\App\Entity\Origin::class, "origin")
			->leftJoin(\App\Entity\Origin::class, "ancestors", "WITH", "CONTAINS(ancestors.path, origin.path) = TRUE")
			->leftJoin(
				\App\Entity\Origin::class,
				"child",
				"WITH",
				"child.path != origin.path AND IS_CONTAINED_BY(child.path, origin.path) = TRUE",
			)
			->orderBy("origin.path", "ASC")
			->where("origin.path = :path")
			->setParameter("path", $uriVariables["path"])
			->groupBy("origin")
			->setMaxResults(1);

		$result = $originQb->getQuery()->getResult()[0] ?? null;

		if (null === $result) {
			return null;
		}

		$resource = static::fromEntity($result[0]);
		$resource->isLeaf = 0 === $result["children"];
		$resource->namePath = array_values(array_unique(json_decode($result["namePath"])));
		return $resource;
	}

	public static function fromEntity(?\App\Entity\Origin $entity): ?Origin
	{
		if (null === $entity) {
			return null;
		}

		$resource = new Origin();
		$resource->name = $entity->name;
		$resource->namePath = empty($entity->namePath) ? [$entity->name] : $entity->namePath;
		$resource->path = $entity->path->getPath();
		$resource->proposal = null === $entity->validatedAt;
		return $resource;
	}
}
