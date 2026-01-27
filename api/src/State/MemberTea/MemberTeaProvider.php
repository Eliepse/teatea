<?php

namespace App\State\MemberTea;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Member;
use App\ApiResource\MemberTea;
use App\ApiResource\Tea;
use App\ApiResource\TeaList;
use App\Entity\User;
use App\Enum\TeaListPivotType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * @implements ProviderInterface<MemberTea|null>
 */
readonly class MemberTeaProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
	) {}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): ?MemberTea
	{
		assert(false === $operation instanceof CollectionOperationInterface);

		$user = $this->security->getUser();
		assert($user instanceof User);

		$listSlug = $uriVariables["slug"] ?? null;
		$pivotId = $uriVariables["id"] ?? null;

		if (empty($listSlug) || empty($pivotId)) {
			return null;
		}

		$type = TeaListPivotType::tryFromSlug($listSlug) ?? TeaListPivotType::Custom;

		$listQuery = $this->em
			->createQueryBuilder()
			->select("pivot", "author", "list")
			->from(\App\Entity\TeaListPivot::class, "pivot")
			->leftJoin("pivot.author", "author")
			->leftJoin("pivot.list", "list")
			->where("pivot = :pivot")
			->andWhere("pivot.type = :type AND author = :author")
			->setParameter("pivot", $pivotId)
			->setParameter("type", $type)
			->setParameter("author", $user);

		if (TeaListPivotType::Custom === $type) {
			$listQuery->andWhere("pivot.slug = :slug", $listSlug);
		}

		$result = $listQuery->getQuery()->getOneOrNullResult();
		$resource = static::fromEntity($result);

		// Hydrate native list
		if (TeaListPivotType::Custom !== $type) {
			$resource->list = new TeaList();
			$resource->list->id = 0;
			$resource->list->name = $type->name;
			$resource->list->slug = $type->getSlug();
			$resource->list->owner = $resource->author;
		}

		return $resource;
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
		$resource->author->id = $entity->author->id;
		$resource->author->username = $entity->author->username;

		if (null !== $entity->list) {
			$resource->list = new TeaList();
			$resource->list->id = $entity->list->id;
		}

		$resource->createdAt = $entity->createdAt;

		return $resource;
	}
}
