<?php

namespace App\State\Hydration;

use App\ApiResource\Business;
use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;

/**
 * @implements ResourceHydrator<Business>
 */
#[AsTaggedItem(\App\Entity\Business::class)]
final readonly class BusinessHydrator implements ResourceHydrator
{
	/**
	 * @inheritDoc
	 */
	public function hydrate(?object $entity): ?Business
	{
		if (null === $entity) {
			return null;
		}

		assert($entity instanceof \App\Entity\Business);

		$resource = new Business();
		$resource->id = $entity->id;
		$resource->name = $entity->name;
		return $resource;
	}

	/**
	 * @inheritDoc
	 */
	public function hydrateReference(?object $entity): ?Business
	{
		if (null === $entity) {
			return null;
		}

		assert($entity instanceof \App\Entity\Business);

		$resource = new Business();
		$resource->id = $entity->id;
		return $resource;
	}
}
