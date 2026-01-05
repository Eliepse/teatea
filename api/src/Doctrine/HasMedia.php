<?php

namespace App\Doctrine;

/**
 * Entities with this interface can be associated to MediaObject through the MediaObjectPivot.
 * The association is made through a polymorphic association not supported by Doctrine ORM:
 * manual hydration and attach/detach are required.
 */
interface HasMedia
{
	/**
	 * Return the type of the entity for the polymorphic association (usually the FQCN)
	 */
	public function getType(): string;

	/**
	 * Return the unique identifier of the entity for the polymorphic association
	 */
	public function getId(): int;
}
