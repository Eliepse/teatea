<?php

namespace App\State;

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

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): Origin|array|null
	{
		$isCollection = $operation instanceof CollectionOperationInterface;
		$path = $uriVariables["path"] ?? null;

		if (null !== $path && empty($path)) {
			throw new BadRequestHttpException();
		}

		$originQb = $this->em->createQueryBuilder()
			->select("origin")
			->from(\App\Entity\Origin::class, "origin")
			->orderBy("origin.path", "ASC");

		if ($isCollection) {
			return array_map(
				fn(\App\Entity\Origin $type) => static::fromEntity($type),
				$originQb->getQuery()->getResult(),
			);
		}

		$originQb
			->where("origin.path = :path")
			->setParameter("path", $uriVariables["path"])
			->setMaxResults(1);

		/** @var \App\Entity\Origin|null $typeEntities */
		$typeEntities = $originQb->getQuery()->getResult()[0] ?? null;
		return static::fromEntity($typeEntities);
	}

	public static function fromEntity(?\App\Entity\Origin $entity): ?Origin
	{
		if (null === $entity) {
			return null;
		}

		$resource = new Origin();
		$resource->name = $entity->name;
		$resource->path = $entity->path->getPath();
		return $resource;
	}
}
