<?php

namespace App\State\TeaList;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\MemberTea;
use App\Entity\User;
use App\Enum\TeaListPivotType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * @implements ProviderInterface<MemberTea[]>
 */
readonly class ListedTeaCollectionProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): array
	{
		$user = $this->security->getUser();
		assert($operation instanceof CollectionOperationInterface, "Only supports collection operations");
		assert($user instanceof User);


		$list = $this->em->find(\App\Entity\TeaList::class, $uriVariables["listId"]);
		if (empty($list)) {
			throw new NotFoundHttpException();
		}

		$listedTeaQuery = $this->em->createQueryBuilder()
			->select("pivot")
			->from(\App\Entity\TeaListPivot::class, "pivot")
			->andWhere("pivot.list = :list")
			->setParameter("list", $list);

		return array_map(
			fn($entity) => ListedTeaProvider::fromEntity($entity),
			$listedTeaQuery->getQuery()->getResult(),
		);
	}
}
