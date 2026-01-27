<?php

namespace App\State\TeaList;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\TeaList;
use App\Entity\User;
use App\Enum\TeaListPivotType;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * @implements ProviderInterface<TeaList|null>
 */
readonly class NativeTeaListProvider implements ProviderInterface
{
	public function __construct(
		private Security $security,
	) {}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): ?TeaList
	{
		assert(false === $operation instanceof CollectionOperationInterface);

		$user = $this->security->getUser();
		assert($user instanceof User);

		$type = $operation->getExtraProperties()["list"] ?? null;
		assert($type instanceof TeaListPivotType);

		$entity = new \App\Entity\TeaList();
		$entity->id = -1;
		$entity->owner = $user;
		$entity->name = $type->name;
		return TeaListProvider::fromEntity($entity);
	}
}
