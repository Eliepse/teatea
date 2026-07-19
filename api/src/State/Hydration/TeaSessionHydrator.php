<?php

namespace App\State\Hydration;

use App\ApiResource\TeaSession;
use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;

/**
 * @implements ResourceHydrator<TeaSession>
 */
#[AsTaggedItem(\App\Entity\TeaSession::class)]
final readonly class TeaSessionHydrator implements ResourceHydrator
{
	public function __construct(
		private ResourceHydrator $hydrator,
	) {
	}

	/**
	 * @inheritDoc
	 */
	public function hydrate(?object $entity): ?TeaSession
	{
		if (null === $entity) {
			return null;
		}

		assert($entity instanceof \App\Entity\TeaSession);

		$resource = new TeaSession();
		$resource->id = $entity->id;
		$resource->note = $entity->note;
		$resource->brewingType = $entity->brewingType;
		$resource->teaQuantity = $entity->teaQuantity?->toGrams();
		$resource->waterMl = $entity->waterVolume?->toMl();
		$resource->drankAt = $entity->drankAt;
		$resource->quality = $entity->quality;
		$resource->steeps = $entity->getSteeps();

		$resource->tea = $this->hydrator->hydrate($entity->tea);
		$resource->collectionTea = $this->hydrator->hydrate($entity->collectionTea);
		/** @noinspection PhpFieldAssignmentTypeMismatchInspection */
		$resource->author = $this->hydrator->hydrate($entity->author);

		return $resource;
	}

	/**
	 * @inheritDoc
	 */
	public function hydrateReference(?object $entity): ?TeaSession
	{
		if (null === $entity) {
			return null;
		}

		assert($entity instanceof \App\Entity\TeaSession);

		$resource = new TeaSession();
		$resource->id = $entity->id;
		return $resource;
	}
}
