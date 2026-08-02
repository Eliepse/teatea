<?php

namespace App\State\Hydration;

use App\ApiResource\Social\Post;
use App\State\Member\MemberProvider;
use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;

/**
 * @implements ResourceHydrator<Post>
 */
#[AsTaggedItem(\App\Entity\Social\Post::class)]
final readonly class PostHydrator implements ResourceHydrator
{
	public function __construct(
		private ResourceHydrator $hydrator,
	)
	{
	}

	/**
	 * @inheritDoc
	 */
	public function hydrate(?object $entity): ?Post
	{
		if (null === $entity) {
			return null;
		}

		assert($entity instanceof \App\Entity\Social\Post);

		$resource = new Post();
		$resource->id = $entity->id;
		$resource->content = $entity->content;
		/** @noinspection PhpFieldAssignmentTypeMismatchInspection */
		$resource->author = $this->hydrator->hydrate($entity->author);
		$resource->createdAt = $entity->createdAt;
		$resource->updatedAt = $entity->updatedAt;

		$resource->photos = array_map(fn($m) => $this->hydrator->hydrate($m), $entity->media?->toArray() ?? []);

		return $resource;
	}

	/**
	 * @inheritDoc
	 */
	public function hydrateReference(?object $entity): ?Post
	{
		if (null === $entity) {
			return null;
		}

		assert($entity instanceof \App\Entity\Social\Post);

		$resource = new Post();
		$resource->id = $entity->id;
		return $resource;
	}
}
