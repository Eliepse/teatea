<?php

namespace App\State\Member;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\ActivityGraph;
use App\ApiResource\Member;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * @implements ProviderInterface<ActivityGraph|null>
 */
readonly class MemberProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
	) {
	}

	public function provide(
		Operation $operation,
		array $uriVariables = [],
		array $context = [],
	): array|null|object {
		$query = $this->em->createQueryBuilder()->select("user")->from(User::class, "user");

		if ($operation instanceof CollectionOperationInterface) {
			return array_map(fn($u) => self::hydrate($u), $query->getQuery()->getResult());
		}

		if (empty($uriVariables["id"] ?? null)) {
			throw new NotFoundHttpException();
		}

		$user = $query->where("user.id = :id")->setParameter("id", $uriVariables["id"])->getQuery()->getSingleResult();

		return self::hydrate($user);
	}

	public static function hydrate(User $user): Member
	{
		$resource = new Member();
		$resource->id = $user->id;
		$resource->username = $user->username;
		$resource->email = $user->email;
		$resource->roles = $user->getRoles();
		return $resource;
	}
}
