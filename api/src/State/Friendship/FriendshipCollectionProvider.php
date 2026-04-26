<?php

namespace App\State\Friendship;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Friendship;
use App\Entity\Pivot\Friendship as Entity;
use App\Helper\OperationHelper;
use App\State\Hydration\FriendshipHydrator;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @implements ProviderInterface<Friendship[]>
 */
readonly class FriendshipCollectionProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private FriendshipHydrator $hydrator,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): array
	{
		/** @var string|null $username */
		$username = $uriVariables["username"] ?? null;
		assert($operation instanceof CollectionOperationInterface);
		assert(null !== $username);

		$status = OperationHelper::getParameter($operation, "status");

		$query = $this->em
			->createQueryBuilder()
			->select("friendship", "requestor")
			->from(Entity::class, "friendship")
			->innerJoin("friendship.target", "target")
			->leftJoin("friendship.requestedBy", "requestor")
			->where("target.username = :username")
			->setParameter("username", $username);

		if ("pending" === $status) {
			$query->andWhere("friendship.requestedAt IS NOT NULL")
				->andWhere("friendship.acceptedAt IS NULL AND friendship.rejectedAt IS NULL");
		}

		return array_map(fn($entity) => $this->hydrator->hydrate($entity), $query->getQuery()->getResult());
	}
}
