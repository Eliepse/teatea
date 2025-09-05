<?php

namespace App\State\Drink;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\Pagination\Pagination;
use ApiPlatform\State\Pagination\PartialPaginatorInterface;
use ApiPlatform\State\Pagination\TraversablePaginator;
use ApiPlatform\State\ProviderInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

readonly class TeaDrinksPaginatedProvider implements ProviderInterface
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
//		$user = $this->security->getUser();
//		assert($user instanceof User);
		assert($operation instanceof CollectionOperationInterface);

		if (null === $tea = $this->em->find(\App\Entity\Tea::class, $uriVariables["teaId"])) {
			throw new NotFoundHttpException();
		}

		$isContentful = $operation->getParameters()->get("contentful")?->getValue() ?? false;
		$currentPage = $this->pagination->getPage($context);
		$itemsPerPage = $this->pagination->getLimit($operation, $context);
		$offset = $this->pagination->getOffset($operation, $context);

		$expr = $this->em->createQueryBuilder()->expr();
		$drinkQb = $this->em->createQueryBuilder()
			->select("drink")
			->from(\App\Entity\Drink::class, "drink")
			->where("drink.tea = :tea")->setParameter("tea", $tea)
			->andWhere("drink.teaQuantity IS NOT NULL")
			->orderBy("drink.drankAt", "DESC");

		if ($isContentful) {
			$drinkQb->andWhere(
				$expr->orX(
					"drink.teaQuantity IS NOT NULL",
					"drink.waterVolume IS NOT NULL",
					"drink.note IS NOT NULL",
				),
			);
		}

		$total = (clone $drinkQb)
			->select("COUNT(drink)")
			->resetDQLPart("orderBy")
			->getQuery()
			->getSingleScalarResult();

		if (0 < $total) {
			$entities = $drinkQb
				->setFirstResult($offset)
				->setMaxResults($itemsPerPage)
				->getQuery()->getResult();
		} else {
			$entities = [];
		}

		$items = new \ArrayIterator();

		foreach ($entities as $entity) {
			$items->append(DrinkProvider::hydrate($entity));
		}

		return new TraversablePaginator($items, $currentPage, $itemsPerPage, $total);
	}
}
