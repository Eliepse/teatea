<?php

namespace App\State\Member;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Member;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Uid\Uuid;

/**
 * @implements ProviderInterface<Member[]|Member|null>
 */
readonly class MemberProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): Member|array|null
	{
		$query = $this->em
			->createQueryBuilder()
			->select("user")
			->from(User::class, "user");

		if ($operation instanceof CollectionOperationInterface) {
			return array_map(fn($u) => self::hydrate($u), $query->getQuery()->getResult());
		}

		$username = $uriVariables["username"] ?? null;
		$id = $uriVariables["id"] ?? null;

		if (false === empty($username)) {
			$query->where("user.username = :username")->setParameter("username", $username);
		} elseif (false === empty($id)) {
			// Some endpoints requires the ID (ex: onboarding patch)
			$query->where("user.id = :id")->setParameter("id", $id);
		} else {
			return null;
		}

		$user = $this->security->getUser();
		$checkFriendship = $user instanceof User && $user->username !== $username;
		if ($checkFriendship) {
			$query
				->addSelect("friend_requests")
				->leftJoin("user.friendRequestsReceived", "friend_requests", "WITH", "friend_requests.requestedBy = :requestUser")
				->setParameter("requestUser", $user);
		}

		/** @var User|null $entity */
		$entity = $query->getQuery()->getOneOrNullResult();
		$member = self::hydrate($entity);

		if(null !== $member && $checkFriendship) {
			$member->friendshipped_at = $entity->findFriendship($user)?->friendshippedAt();
		}

		return $member;
	}

	public static function hydrate(?User $user): ?Member
	{
		if (null === $user) {
			return null;
		}

		$resource = new Member();
		$resource->id = $user->id;
		$resource->username = $user->username ?? Uuid::v4();
		$resource->email = $user->email;
		$resource->roles = $user->getRoles();
		return $resource;
	}
}
