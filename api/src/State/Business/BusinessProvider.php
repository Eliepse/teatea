<?php

namespace App\State\Business;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Business;
use App\ApiResource\TeaType;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\Proxy;

/**
 * @implements ProviderInterface<Business|null>
 */
readonly class BusinessProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
	) {}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): ?Business
	{
		assert(!$operation instanceof CollectionOperationInterface);

		$expr = $this->em->getExpressionBuilder();
		$query = $this->em
			->createQueryBuilder()
			->select("business")
			->from(\App\Entity\Business::class, "business")
			->where("business.id = :id")
			->setParameter("id", $uriVariables["id"])
			->setMaxResults(1);

		return static::fromEntity($query->getQuery()->getResult()[0] ?? null);
	}

	public static function fromEntity(?\App\Entity\Business $entity): ?Business
	{
		if (null === $entity) {
			return null;
		}

		if ($entity instanceof Proxy && false === $entity->__isInitialized()) {
			return null;
		}

		$resource = new Business();
		$resource->id = $entity->id;
		$resource->name = $entity->name;

		return $resource;
	}
}
