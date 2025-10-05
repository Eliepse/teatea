<?php

namespace App\State\TeaList;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\ListedTea;
use App\ApiResource\Tea;
use App\ApiResource\TeaList;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * @implements ProviderInterface<ListedTea|null>
 */
readonly class ListedTeaProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): ListedTea|null
	{
		$user = $this->security->getUser();
		assert(false === ($operation instanceof CollectionOperationInterface));
		assert($user instanceof User);

		$listId = $uriVariables["listId"] ?? null;
		$itemId = $uriVariables["id"] ?? null;

		if (empty($listId) || empty($itemId)) {
			return null;
		}

		$listQuery = $this->em->createQueryBuilder()
			->select("listItem")
			->from(\App\Entity\TeaListPivot::class, "listItem")
			->innerJoin("listItem.list", "list", "WITH", "list.owner = :member")
			->where("listItem.tea = :tea")
			->andWhere("listItem.list = :list")
			->setParameter("member", $user)
			->setParameter("tea", $itemId)
			->setParameter("list", $listId);

		$result = $listQuery->getQuery()->getOneOrNullResult();
		return static::fromEntity($result);
	}

	public static function fromEntity(?\App\Entity\TeaListPivot $entity): ?ListedTea
	{
		if (null === $entity) {
			return null;
		}

		$resource = new ListedTea();
		$resource->id = $entity->id;

		$resource->tea = new Tea();
		$resource->tea->id = $entity->tea->id;

		$resource->list = new TeaList();
		$resource->list->id = $entity->list->id;
		$resource->createdAt = $entity->createdAt;

		return $resource;
	}
}
