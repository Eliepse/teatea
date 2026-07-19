<?php

namespace App\State\Hydration;

use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;
use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;

/**
 * @template TOutput of object
 */
#[AutoconfigureTag]
interface ResourceHydrator
{
	/**
	 * Return the hydrated resource from the given enity
	 *
	 * @param object|null $entity
	 *
	 * @return TOutput|null
	 */
	public function hydrate(?object $entity): ?object;

	/**
	 * Return the resource with only the elements required to generate an Iri from it
	 *
	 * @param object|null $entity
	 *
	 * @return TOutput|null
	 */
	public function hydrateReference(?object $entity): ?object;
}
