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
	) {}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): ?TeaList
	{
		assert(false === $operation instanceof CollectionOperationInterface);

		$user = $this->security->getUser();
		assert($user instanceof User);

		if (empty($slug = $uriVariables["slug"] ?? null)) {
			throw new BadRequestHttpException();
		}

		$type = TeaListPivotType::tryFromSlug($slug);

		// Handle native lists
		// Those list are available to query even if not persisted
		// in database. They're auto persisted on the first tea added.
		if (TeaListPivotType::Custom !== $type) {
			$entity = new \App\Entity\TeaList();
			$entity->id = -1;
			$entity->slug = $type->getSlug();
			$entity->name = $type->name;
			$entity->owner = $user;
			return static::fromEntity($entity);
		}

		$listQuery = $this->em
			->createQueryBuilder()
			->select("list", "owner")
			->from(\App\Entity\TeaList::class, "list")
			->leftJoin("list.owner", "owner")
			->where("list.owner = :member")
			->setParameter("member", $user)
			->andWhere("list.slug = :slug")
			->setParameter("slug", $slug);

		return static::fromEntity($listQuery->getQuery()->getOneOrNullResult());
	}

	public static function fromEntity(?\App\Entity\TeaList $entity): ?TeaList
	{
		if (null === $entity) {
			return null;
		}

		$resource = new TeaList();
		$resource->id = $entity->id;
		$resource->slug = $entity->slug;
		$resource->name = $entity->name;
		$resource->owner = new Member();
		$resource->owner->username = $entity->owner->username;

		return $resource;
	}
}
