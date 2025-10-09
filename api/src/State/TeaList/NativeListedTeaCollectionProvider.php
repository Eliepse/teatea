<?php

namespace App\State\TeaList;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\ListedTea;
use App\Entity\User;
use App\Enum\TeaListPivotType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * Native lists doesn't need to be linked to a list entity
 *
 * @implements ProviderInterface<ListedTea[]>
 */
readonly class NativeListedTeaCollectionProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): array
	{
		assert($operation instanceof CollectionOperationInterface, "Only supports collection operations");

		$user = $this->security->getUser();
		assert($user instanceof User);

		$listType = $operation->getExtraProperties()["list"];
		assert($listType instanceof TeaListPivotType);

		$listedTeaQuery = $this->em->createQueryBuilder()
			->select("pivot")
			->from(\App\Entity\TeaListPivot::class, "pivot")
			->andWhere("pivot.author = :member")
			->andWhere("pivot.type = :type")
			->setParameter("member", $user)
			->setParameter("type", $listType);

		return array_map(
			fn($entity) => ListedTeaProvider::fromEntity($entity),
			$listedTeaQuery->getQuery()->getResult(),
		);
	}
}
