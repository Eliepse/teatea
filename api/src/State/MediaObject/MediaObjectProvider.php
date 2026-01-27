<?php

namespace App\State\MediaObject;

use App\ApiResource\MediaObject;

final class MediaObjectProvider
{
	public static function fromEntity(?\App\Entity\MediaObject $entity): ?MediaObject
	{
		if (null === $entity) {
			return null;
		}

		$resource = new MediaObject();
		$resource->id = $entity->id;
		$resource->contentUrl = $entity->filePath;
		return $resource;
	}
}
