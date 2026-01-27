<?php

namespace App\State\TeaList;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\TeaList;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * @implements ProviderInterface<TeaList[]|null>
 */
readonly class TeaListCollectionProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
	) {}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): ?array
	{
		$user = $this->security->getUser();
		assert($operation instanceof CollectionOperationInterface);
		assert($user instanceof User);

		if ($user->username !== $uriVariables["username"]) {
			throw new AccessDeniedHttpException();
		}

		$listQuery = $this->em
			->createQueryBuilder()
			->select("list", "owner")
			->from(\App\Entity\TeaList::class, "list")
			->leftJoin("list.owner", "owner")
			->where("list.owner = :member")
			->setParameter("member", $user);

		return array_map(fn($entity) => TeaListProvider::fromEntity($entity), $listQuery->getQuery()->getResult());
	}
}
