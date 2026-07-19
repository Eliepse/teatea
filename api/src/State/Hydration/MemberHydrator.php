<?php

namespace App\State\Hydration;

use App\ApiResource\Member;
use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;
use Symfony\Component\Uid\Uuid;

/**
 * @implements ResourceHydrator<Member>
 */
#[AsTaggedItem(\App\Entity\User::class)]
final readonly class MemberHydrator implements ResourceHydrator
{
	/**
	 * @inheritDoc
	 */
	public function hydrate(?object $entity): ?Member
	{
		if (null === $entity) {
			return null;
		}

		assert($entity instanceof \App\Entity\User);

		$resource = new Member();
		$resource->id = $entity->id;
		$resource->username = $entity->username ?? Uuid::v4();
		$resource->email = $entity->email;
		$resource->roles = $entity->getRoles();

		return $resource;
	}

	/**
	 * @inheritDoc
	 */
	public function hydrateReference(?object $entity): ?Member
	{
		if (null === $entity) {
			return null;
		}

		assert($entity instanceof \App\Entity\User);

		$resource = new Member();
		$resource->id = $entity->id;

		return $resource;
	}
}
