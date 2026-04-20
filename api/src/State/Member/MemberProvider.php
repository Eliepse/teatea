<?php

namespace App\State\Member;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\ActivityGraph;
use App\ApiResource\Member;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Uid\Uuid;

/**
 * @implements ProviderInterface<Member[]|Member|null>
 */
readonly class MemberProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
	) {}

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

		return self::hydrate($query->getQuery()->getOneOrNullResult());
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
