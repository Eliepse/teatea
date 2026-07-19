<?php

namespace App\State\Hydration;

use App\ApiResource\MediaObject;
use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;
use Vich\UploaderBundle\Storage\StorageInterface;

/**
 * @implements ResourceHydrator<MediaObject>
 */
#[AsTaggedItem(\App\Entity\Pivot\MediaObjectPivot::class)]
final readonly class MediaObjectPivotHydrator implements ResourceHydrator
{
	public function __construct(
		private StorageInterface $storage,
	) {
	}

	public function hydrate(?object $entity): ?MediaObject
	{
		if (null === $entity) {
			return null;
		}

		assert($entity instanceof \App\Entity\Pivot\MediaObjectPivot);

		$resource = new MediaObject();
		$resource->id = $entity->media->id;
		$resource->contentUrl = $this->storage->resolveUri($entity->media, "file");
		$resource->placeholder = $entity->media->placeholder;
		$resource->collection = $entity->collection;
		return $resource;
	}

	public function hydrateReference(?object $entity): ?MediaObject
	{
		if (null === $entity) {
			return null;
		}

		assert($entity instanceof \App\Entity\Pivot\MediaObjectPivot);

		$resource = new MediaObject();
		$resource->id = $entity->media->id;
		return $resource;
	}
}
