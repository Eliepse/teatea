<?php

namespace App\State\Hydration;

use App\ApiResource\Origin;
use App\State\Hydration\ResourceHydrator;

class OriginHydrator implements ResourceHydrator
{

	/**
	 * @inheritDoc
	 */
	public function hydrate(?object $entity): ?\App\ApiResource\Origin
	{
		if (null === $entity) {
			return null;
		}

		$resource = new Origin();
		$resource->name = $entity->name;
		$resource->namePath = empty($entity->namePath) ? [$entity->name] : $entity->namePath;
		$resource->path = $entity->path->getPath();
		$resource->proposal = null === $entity->validatedAt;
		return $resource;
	}

	/**
	 * @inheritDoc
	 */
	public function hydrateReference(?object $entity): ?\App\ApiResource\Origin
	{
		if (null === $entity) {
			return null;
		}

		$resource = new Origin();
		$resource->path = $entity->path->getPath();
		return $resource;
	}
}
