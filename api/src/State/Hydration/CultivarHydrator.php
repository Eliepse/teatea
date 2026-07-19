<?php

namespace App\State\Hydration;

use App\ApiResource\Cultivar;
use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;

/**
 * @implements ResourceHydrator<Cultivar>
 */
#[AsTaggedItem(\App\Entity\Cultivar::class)]
final readonly class CultivarHydrator implements ResourceHydrator
{
	/**
	 * @inheritDoc
	 */
	public function hydrate(?object $entity): ?Cultivar
	{
		if (null === $entity) {
			return null;
		}

		assert($entity instanceof \App\Entity\Cultivar);

		$resource = new Cultivar();
		$resource->id = $entity->id;
		$resource->name = $entity->name;
		return $resource;
	}

	/**
	 * @inheritDoc
	 */
	public function hydrateReference(?object $entity): ?Cultivar
	{
		if (null === $entity) {
			return null;
		}

		assert($entity instanceof \App\Entity\Cultivar);

		$resource = new Cultivar();
		$resource->id = $entity->id;
		return $resource;
	}
}
