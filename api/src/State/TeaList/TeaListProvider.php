<?php

namespace App\State\TeaList;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Member;
use App\ApiResource\TeaList;
use App\Entity\User;
use App\Enum\TeaListType;
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

		$slug = $uriVariables["slug"] ?? null;

		if (empty($slug)) {
			throw new BadRequestHttpException();
		}

		$listQuery = $this->em->createQueryBuilder()
			->select("list", "owner")
			->from(\App\Entity\TeaList::class, "list")
			->leftJoin("list.owner", "owner")
			->where("list.owner = :member")
			->andWhere("list.slug = :slug")
			->setParameter("member", $user)
			->setParameter("slug", $uriVariables["path"]);

		$result = $listQuery->getQuery()->getOneOrNullResult();

		if (null !== $result) {
			return static::fromEntity($result);
		}

		// Try to handle native lists
		// Those list are available to query even if not persisted
		// in database. They're auto persisted on the first tea added.

		$entity = new \App\Entity\TeaList();
		$entity->owner = $user;
		$entity->slug = $slug;

		if ("_" . TeaListType::Favorites->value === $slug) {
			$entity->type = TeaListType::Favorites;
			return static::fromEntity($entity);
		}

		if ("_" . TeaListType::Wishlist->value === $slug) {
			$entity->type = TeaListType::Wishlist;
			return static::fromEntity($entity);
		}

		return null;
	}

	public static function fromEntity(?\App\Entity\TeaList $entity): ?TeaList
	{
		if (null === $entity) {
			return null;
		}

		$resource = new TeaList();
		$resource->id = $entity->id;
		$resource->type = $entity->type;

		$resource->name = match ($entity->type) {
			TeaListType::Favorites => "Favorites",
			TeaListType::Wishlist => "Wishlist",
			default => $entity->name,
		};

		$resource->owner = new Member();
		$resource->owner->username = $entity->owner->username;

		return $resource;
	}
}
