<?php

namespace App\State\Hydration;

use App\ApiResource\CollectionTea;
use App\State\Business\BusinessProvider;
use App\State\Member\MemberProvider;
use App\State\Tea\TeaProvider;

/**
 * @implements ResourceHydrator<CollectionTea>
 */
readonly class CollectionTeaHydrator implements ResourceHydrator
{
	public function __construct(
		private MediaObjectHydrator $mediaHydrator,
	) {}

	public function hydrate(?object $entity): ?object
	{
		if (null === $entity) {
			return null;
		}

		assert($entity instanceof \App\Entity\CollectionTea);

		$tea = new CollectionTea();
		$tea->id = $entity->id;
		$tea->tea = TeaProvider::hydrateResource($entity->tea);
		$tea->owner = MemberProvider::hydrate($entity->owner);
		$tea->description = $entity->description;
		$tea->acquiredAt = $entity->acquiredAt;
		$tea->acquiredFrom = BusinessProvider::fromEntity($entity->acquiredFrom);
		$tea->finishedAt = $entity->finishedAt;
		$tea->rating = $entity->rating;

		$tea->thumbnail = $this->mediaHydrator->hydrate($entity->media?->first() ?: null);

		return $tea;
	}
}
