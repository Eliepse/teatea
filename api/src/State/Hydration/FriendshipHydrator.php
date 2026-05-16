<?php

namespace App\State\Hydration;

use App\ApiResource\Friendship;
use App\State\Member\MemberProvider;

/**
 * @implements ResourceHydrator<Friendship>
 */
readonly class FriendshipHydrator implements ResourceHydrator
{
	public function hydrate(?object $entity): ?Friendship
	{
		if (null === $entity) {
			return null;
		}

		assert($entity instanceof \App\Entity\Pivot\Friendship);

		$resource = new Friendship();
		$resource->id = $entity->id;
		$resource->requestor = MemberProvider::hydrate($entity->requestedBy);
		$resource->requestedAt = $entity->requestedAt;

		return $resource;
	}

	public function hydrateReference(?object $entity): ?Friendship
	{
		if (null === $entity) {
			return null;
		}

		assert($entity instanceof \App\Entity\Pivot\Friendship);

		$resource = new Friendship();
		$resource->id = $entity->id;

		return $resource;
	}
}
