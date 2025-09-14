<?php

namespace App\State\TeaSession;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\Pagination\Pagination;
use ApiPlatform\State\Pagination\PartialPaginatorInterface;
use ApiPlatform\State\Pagination\TraversablePaginator;
use ApiPlatform\State\ProviderInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

readonly class TeaSessionsPaginatedProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Pagination $pagination,
		private Security $security,
	) {
	}

	public function provide(
		Operation $operation,
		array $uriVariables = [],
		array $context = [],
	): PartialPaginatorInterface {
		assert($operation instanceof CollectionOperationInterface);

		$isContentful = $operation->getParameters()->get("contentful")?->getValue() ?? false;
		$currentPage = $this->pagination->getPage($context);
		$itemsPerPage = $this->pagination->getLimit($operation, $context);
		$offset = $this->pagination->getOffset($operation, $context);
		$teaId = $context["filters"]["tea"] ?? null;
		$tea = null;

		if (null !== $teaId && null === ($tea = $this->em->find(\App\Entity\Tea::class, $teaId))) {
			throw new NotFoundHttpException();
		}

		$expr = $this->em->createQueryBuilder()->expr();
		$sessionQb = $this->em->createQueryBuilder()
			->select("session")
			->from(\App\Entity\TeaSession::class, "session")
			->andWhere("session.teaQuantity IS NOT NULL")
			->orderBy("session.drankAt", "DESC");

		if (null !== $tea) {
			$sessionQb->andWhere("session.tea = :tea")->setParameter("tea", $tea);
		}

		if ($isContentful) {
			$sessionQb->andWhere(
				$expr->orX(
					"session.teaQuantity IS NOT NULL",
					"session.waterVolume IS NOT NULL",
					"session.note IS NOT NULL",
				),
			);
		}

		$total = (clone $sessionQb)
			->select("COUNT(session)")
			->resetDQLPart("orderBy")
			->getQuery()
			->getSingleScalarResult();

		if (0 < $total) {
			$entities = $sessionQb
				->setFirstResult($offset)
				->setMaxResults($itemsPerPage)
				->getQuery()->getResult();
		} else {
			$entities = [];
		}

		$items = new \ArrayIterator();

		foreach ($entities as $entity) {
			$items->append(TeaSessionProvider::hydrate($entity));
		}

		return new TraversablePaginator($items, $currentPage, $itemsPerPage, $total);
	}
}
