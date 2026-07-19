<?php

namespace App\State\Hydration;

use App\ApiResource\TeaType;
use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;

/**
 * @implements ResourceHydrator<TeaType>
 */
#[AsTaggedItem(\App\Entity\TeaType::class)]
final readonly class TeaTypeHydrator implements ResourceHydrator
{
	/**
	 * @inheritDoc
	 */
	public function hydrate(?object $entity): ?TeaType
	{
		if (null === $entity) {
			return null;
		}

		assert($entity instanceof \App\Entity\TeaType);

		$resource = new TeaType();
		$resource->name = $entity->name;
		$resource->slug = $entity->slug;
		$resource->family = $entity->family;

		return $resource;
	}

	/**
	 * @inheritDoc
	 */
	public function hydrateReference(?object $entity): ?TeaType
	{
		if (null === $entity) {
			return null;
		}

		assert($entity instanceof \App\Entity\TeaType);

		$resource = new TeaType();
		$resource->slug = $entity->slug;

		return $resource;
	}
}
