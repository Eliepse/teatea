<?php

namespace App\State\Hydration;

use App\ApiResource\Social\Post;
use App\State\Member\MemberProvider;

/**
 * @implements ResourceHydrator<\App\Entity\Social\Post>
 */
class PostHydrator implements ResourceHydrator
{
	public function __construct(

	)
	{
	}

	/**
	 * @inheritDoc
	 */
	public function hydrate(?object $entity): ?\App\ApiResource\Social\Post
	{
		if (null === $entity) {
			return null;
		}

		assert($entity instanceof \App\Entity\Social\Post);

		$resource = new Post();
		$resource->id = $entity->id;
		$resource->content = $entity->content;
		$resource->author = MemberProvider::hydrate($entity->author);
		$resource->createdAt = $entity->createdAt;
		$resource->updatedAt = $entity->updatedAt;
		return $resource;
	}

	/**
	 * @inheritDoc
	 */
	public function hydrateReference(?object $entity): ?\App\ApiResource\Social\Post
	{
		if (null === $entity) {
			return null;
		}

		$resource = new Post();
		$resource->id = $entity->id;
		return $resource;
	}
}
