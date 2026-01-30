<?php

namespace App\State\Hydration;

/**
 * @template TOutput of object
 */
interface ResourceHydrator
{
	/**
	 * @param object|null $entity
	 *
	 * @return TOutput|null
	 */
	public function hydrate(?object $entity): ?object;
}
