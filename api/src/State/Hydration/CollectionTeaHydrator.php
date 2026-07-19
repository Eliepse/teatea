<?php

namespace App\State\Hydration;

use App\ApiResource\CollectionTea;
use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;

/**
 * @implements ResourceHydrator<CollectionTea>
 */
#[AsTaggedItem(\App\Entity\CollectionTea::class)]
final readonly class CollectionTeaHydrator implements ResourceHydrator
{
	public function __construct(
		private ResourceHydrator $hydrator,
	) {
	}

	public function hydrate(?object $entity): ?CollectionTea
	{
		if (null === $entity) {
			return null;
		}

		assert($entity instanceof \App\Entity\CollectionTea);

		$resource = new CollectionTea();
		$resource->id = $entity->id;
		/** @noinspection PhpFieldAssignmentTypeMismatchInspection */
		$resource->tea = $this->hydrator->hydrate($entity->tea);
		/** @noinspection PhpFieldAssignmentTypeMismatchInspection */
		$resource->owner = $this->hydrator->hydrate($entity->owner);
		$resource->description = $entity->description;
		$resource->acquiredAt = $entity->acquiredAt;
		$resource->finishedAt = $entity->finishedAt;
		$resource->rating = $entity->rating;
		$resource->thumbnail = $this->hydrator->hydrate($entity->media?->first() ?: null);
		return $resource;
	}

	public function hydrateReference(?object $entity): ?CollectionTea
	{
		if (null === $entity) {
			return null;
		}

		assert($entity instanceof \App\Entity\CollectionTea);

		$tea = new CollectionTea();
		$tea->id = $entity->id;
		/** @noinspection PhpFieldAssignmentTypeMismatchInspection */
		$tea->owner = $this->hydrator->hydrate($entity->owner);

		return $tea;
	}
}
