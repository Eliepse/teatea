<?php

namespace App\State\Hydration;

use App\ApiResource\Origin;
use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;

/**
 * @implements ResourceHydrator<Origin>
 */
#[AsTaggedItem(\App\Entity\Origin::class)]
final readonly class OriginHydrator implements ResourceHydrator
{

	/**
	 * @inheritDoc
	 */
	public function hydrate(?object $entity): ?Origin
	{
		if (null === $entity) {
			return null;
		}

		assert($entity instanceof \App\Entity\Origin);

		$resource = new Origin();
		$resource->name = $entity->name;
		$resource->namePath = empty($entity->namePath) ? [$entity->name] : $entity->namePath;
		$resource->path = $entity->path->getPath();
		$resource->proposal = null === $entity->validatedAt;
		return $resource;
	}

	/**
	 * @inheritDoc
	 */
	public function hydrateReference(?object $entity): ?Origin
	{
		if (null === $entity) {
			return null;
		}

		assert($entity instanceof \App\Entity\Origin);

		$resource = new Origin();
		$resource->path = $entity->path->getPath();
		return $resource;
	}
}
