<?php

namespace App\State\Member;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Member;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @implements ProviderInterface<Member[]>
 */
readonly class FriendCollectionProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): array
	{
		/** @var string|null $username */
		$username = $uriVariables["username"] ?? null;
		assert($operation instanceof CollectionOperationInterface);
		assert(null !== $username);


		$query = $this->em
			->createQueryBuilder()
			->select("user")
			->from(User::class, "user")
			->innerJoin("user.referrer", "referrer")
			->where("referrer.username = :username")
			->setParameter("username", $username);

		return array_map(fn($user) => self::hydrate($user), $query->getQuery()->getResult());
	}

	public static function hydrate(?User $user): ?Member
	{
		if (null === $user) {
			return null;
		}

		$resource = new Member();
		$resource->username = $user->username;
		return $resource;
	}
}
