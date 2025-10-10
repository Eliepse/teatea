<?php

namespace App\State\TeaList;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Member;
use App\ApiResource\MemberTea;
use App\ApiResource\Tea;
use App\ApiResource\TeaList;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * @implements ProviderInterface<MemberTea|null>
 */
readonly class ListedTeaProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): MemberTea|null
	{
		assert(false === ($operation instanceof CollectionOperationInterface));

		$user = $this->security->getUser();
		assert($user instanceof User);

		$username = $uriVariables["username"] ?? null;
		$pivotId = $uriVariables["pivotId"] ?? null;

		if ($user->username !== $username) {
			throw new AccessDeniedHttpException();
		}

		if (empty($username) || empty($pivotId)) {
			return null;
		}

		$listQuery = $this->em->createQueryBuilder()
			->select("pivot", "member", "tea", "list")
			->from(\App\Entity\TeaListPivot::class, "pivot")
			->innerJoin("pivot.author", "member", "WITH", "member.username = :username")
			->leftJoin("pivot.list", "list")
			->where("pivot = :pivot")
			->setParameter("username", $username)
			->setParameter("pivot", $pivotId);

		$result = $listQuery->getQuery()->getOneOrNullResult();
		return static::fromEntity($result);
	}

	public static function fromEntity(?\App\Entity\TeaListPivot $entity): ?MemberTea
	{
		if (null === $entity) {
			return null;
		}

		$resource = new MemberTea();
		$resource->id = $entity->id;
		$resource->type = $entity->type;

		$resource->tea = new Tea();
		$resource->tea->id = $entity->tea->id;

		$resource->author = new Member();
		$resource->author->username = $entity->author->username;

		if (null !== $entity->list) {
			$resource->list = new TeaList();
			$resource->list->id = $entity->list->id;
		}

		$resource->createdAt = $entity->createdAt;

		return $resource;
	}
}
