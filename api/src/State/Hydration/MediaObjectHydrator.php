<?php

namespace App\State\Hydration;

use App\Entity\MediaObject;
use App\Entity\Pivot\MediaObjectPivot;
use Vich\UploaderBundle\Storage\StorageInterface;

final readonly class MediaObjectHydrator implements ResourceHydrator
{
	public function __construct(
		private StorageInterface $storage,
	) {
	}

	public function hydrate(?object $entity): ?object
	{
		if (null === $entity) {
			return null;
		}

		assert($entity instanceof MediaObject || $entity instanceof MediaObjectPivot);
		$media = $entity instanceof MediaObject ? $entity : $entity->media;

		$resource = new \App\ApiResource\MediaObject();
		$resource->id = $media->id;
		$resource->contentUrl = $this->storage->resolveUri($media, "file");

		if ($entity instanceof MediaObjectPivot) {
			$resource->collection = $entity->collection;
		}

		return $resource;
	}
}
