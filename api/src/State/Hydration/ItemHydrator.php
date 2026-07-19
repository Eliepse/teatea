<?php

namespace App\State\Hydration;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\AsAlias;
use Symfony\Component\DependencyInjection\Attribute\AutowireLocator;
use Symfony\Component\DependencyInjection\ServiceLocator;

#[AsAlias]
final readonly class ItemHydrator implements ResourceHydrator
{
	public function __construct(
		#[AutowireLocator(ResourceHydrator::class, excludeSelf: true)]
		private ServiceLocator $hydrators,
		private EntityManagerInterface $em,
	) {
	}

	/**
	 * @inheritDoc
	 */
	public function hydrate(?object $entity): ?object
	{
		if (false === is_object($entity)) {
			return null;
		}

		$hydrator = $this->findHydrator($entity);

		// Only hydrate as a reference if not loaded (prevent forcing lazy loading)
		if ($this->em->isUninitializedObject($entity)) {
			return $hydrator->hydrateReference($entity);
		}

		return $hydrator->hydrate($entity);
	}

	/**
	 * @inheritDoc
	 */
	public function hydrateReference(?object $entity): ?object
	{
		if (false === is_object($entity)) {
			return null;
		}

		return $this->findHydrator($entity)->hydrateReference($entity);
	}

	private function findHydrator(?object $entity): ResourceHydrator
	{
		/** @var ResourceHydrator|string|null $hydrator */
		$hydrator = $this->hydrators->get($entity::class);

		if (is_string($hydrator) || null === $hydrator) {
			throw new \RuntimeException("Unable to find a hydrator for the entity of type: " . $entity::class);
		}

		return $hydrator;
	}

	public static function getDefaultSupportedClassName(): string
	{
		return self::class;
	}
}
