<?php

namespace App\State\Hydration;

use App\ApiResource\Tea;
use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;

/**
 * @implements ResourceHydrator<Tea>
 */
#[AsTaggedItem(\App\Entity\Tea::class)]
final readonly class TeaHydrator implements ResourceHydrator
{
	public function __construct(
		private ResourceHydrator $hydrator,
	) {
	}

	/**
	 * @inheritDoc
	 */
	public function hydrate(?object $entity): ?Tea
	{
		if (null === $entity) {
			return null;
		}

		assert($entity instanceof \App\Entity\Tea);

		$resource = new Tea();
		$resource->family = $entity->family;
		$resource->id = $entity->id;
//		$resource->originPath = $entity->originPath;
		$resource->year = $entity->year;
		$resource->roast = $entity->roast;
		$resource->addedAt = $entity->createdAt;

		// Relations
		$resource->type = $this->hydrator->hydrate($entity->type);
		$resource->origin = $this->hydrator->hydrate($entity->origin);
		$resource->business = $this->hydrator->hydrate($entity->business);
		$resource->cultivar = $this->hydrator->hydrate($entity->cultivar);

		return $resource;
	}

	/**
	 * @inheritDoc
	 */
	public function hydrateReference(?object $entity): ?Tea
	{
		if (null === $entity) {
			return null;
		}

		assert($entity instanceof \App\Entity\Tea);

		$resource = new Tea();
		$resource->id = $entity->id;
		return $resource;
	}
}
