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
			->from(\App\Entity\TeaType::class, "type")
			->setMaxResults($isCollection ? null : 1);

		/** @var array<\App\Entity\TeaType> $typeEntities */
		$typeEntities = $teaQb->getQuery()->getResult();

		$resources = array_map(function (\App\Entity\TeaType $type) {
			$resource = new TeaType();
			$resource->id = $type->getId();
			$resource->name = $type->name;
			$resource->family = $type->family;
			return $resource;
		}, $typeEntities);

		return $isCollection ? $resources : ($resources[0] ?? null);
	}
}
