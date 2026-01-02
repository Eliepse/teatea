<?php

namespace App\State\Hydration;

interface ResourceHydrator
{
	public function hydrate(?object $entity): ?object;
}
