<?php

namespace App\State;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\TeaType;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @implements ProviderInterface<TeaType|null>
 */
readonly class TeaTypeProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): TeaType|array|null
	{
		$isCollection = $operation instanceof CollectionOperationInterface;
		$expr = $this->em->getExpressionBuilder();

		$teaQb = $this->em->createQueryBuilder()
			->select("type")
			->from(\App\Entity\TeaType::class, "type");

		if ($isCollection) {
			/** @var \App\Entity\TeaType|null $typeEntities */
			$typeEntities = $teaQb->setMaxResults(1)->getQuery()->getResult()[0] ?? null;
			return static::fromEntity($typeEntities);
		}

		return array_map(
			fn(\App\Entity\TeaType $type) => static::fromEntity($type),
			$teaQb->getQuery()->getResult(),
		);
	}

	public static function fromEntity(?\App\Entity\TeaType $type): ?TeaType
	{
		if (null === $type) {
			return null;
		}

		$resource = new TeaType();
		$resource->id = $type->getId();
		$resource->name = $type->name;
		$resource->family = $type->family;
		return $resource;
	}
}
