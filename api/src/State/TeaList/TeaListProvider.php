<?php

namespace App\State\TeaList;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Member;
use App\ApiResource\TeaList;
use App\Entity\User;
use App\Enum\TeaListPivotType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * @implements ProviderInterface<TeaList|null>
 */
readonly class TeaListProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): TeaList|null
	{
		$user = $this->security->getUser();
		assert(false === ($operation instanceof CollectionOperationInterface));
		assert($user instanceof User);

		$nativeList = $operation->getExtraProperties()["nativeList"] ?? null;
		$nativeList = $nativeList instanceof TeaListPivotType ? $nativeList : null;

		// Handle native lists
		// Those list are available to query even if not persisted
		// in database. They're auto persisted on the first tea added.
		if (null !== $nativeList) {
			$entity = new \App\Entity\TeaList();
			$entity->id = -1;
			$entity->owner = $user;
			$entity->name = $nativeList->name;
			return static::fromEntity($entity);
		}

		if (empty($id = $uriVariables["id"] ?? null)) {
			throw new BadRequestHttpException();
		}

		$listQuery = $this->em->createQueryBuilder()
			->select("list", "owner")
			->from(\App\Entity\TeaList::class, "list")
			->leftJoin("list.owner", "owner")
			->where("list.owner = :member")
			->setParameter("member", $user)
			->andWhere("list.id = :id")
			->setParameter("id", $id);

		return static::fromEntity($listQuery->getQuery()->getOneOrNullResult());
	}

	public static function fromEntity(?\App\Entity\TeaList $entity): ?TeaList
	{
		if (null === $entity) {
			return null;
		}

		$resource = new TeaList();
		$resource->id = $entity->id;
		$resource->name = $entity->name;
		$resource->owner = new Member();
		$resource->owner->username = $entity->owner->username;

		return $resource;
	}
}
