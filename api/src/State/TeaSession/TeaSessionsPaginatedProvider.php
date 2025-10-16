<?php

namespace App\State\TeaSession;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\Pagination\Pagination;
use ApiPlatform\State\Pagination\PartialPaginatorInterface;
use ApiPlatform\State\Pagination\TraversablePaginator;
use ApiPlatform\State\ParameterNotFound;
use ApiPlatform\State\ProviderInterface;
use App\Entity\TeaSession;
use App\Helper\Arr;
use App\Repository\OriginRepository;
use App\Repository\UserRepository;
use App\State\Tea\TeaProvider;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

readonly class TeaSessionsPaginatedProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private UserRepository $userRepo,
		private OriginRepository $originRepo,
		private Pagination $pagination,
	) {
	}

	public function provide(
		Operation $operation,
		array $uriVariables = [],
		array $context = [],
	): PartialPaginatorInterface {
		assert($operation instanceof CollectionOperationInterface);

		$isContentful = $operation->getParameters()->get("contentful")?->getValue() ?? false;
		$isContentful = !$isContentful instanceof ParameterNotFound;
		$currentPage = $this->pagination->getPage($context);
		$itemsPerPage = $this->pagination->getLimit($operation, $context);
		$offset = $this->pagination->getOffset($operation, $context);
		$username = $context["filters"]["username"] ?? null;
		$member = null;
		$teaId = $context["filters"]["tea"] ?? null;
		$tea = null;

		if (null !== $teaId && null === ($tea = $this->em->find(\App\Entity\Tea::class, $teaId))) {
			throw new NotFoundHttpException();
		}

		if (null !== $username && null === ($member = $this->userRepo->findOneBy(["username" => $username]))) {
			throw new NotFoundHttpException();
		}

		$expr = $this->em->createQueryBuilder()->expr();
		$sessionQb = $this->em->createQueryBuilder()
			->select("session", "tea", "type")
			->from(\App\Entity\TeaSession::class, "session")
			->leftJoin("session.tea", "tea")
			->leftJoin("tea.type", "type")
			->orderBy("session.drankAt", "DESC");

		if (null !== $tea) {
			$sessionQb->andWhere("session.tea = :tea")->setParameter("tea", $tea);
		}

		if (null !== $member) {
			$sessionQb->andWhere("session.author = :author")->setParameter("author", $member);
		} else {
			$sessionQb->leftJoin("session.author", "author")->addSelect("author");
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

		if (0 === $total) {
			return new TraversablePaginator(new ArrayCollection(), $currentPage, $itemsPerPage, $total);
		}

		/** @var TeaSession[] $entities */
		$entities = $sessionQb
			->setFirstResult($offset)
			->setMaxResults($itemsPerPage)
			->getQuery()
			->getResult();

		$items = new \ArrayIterator();
		$origins = $this->originRepo->getWithAncestors(array_map(fn($s) => $s->tea->originId, $entities));
		$originsById = Arr::keyBy($origins, "id");
		$originMap = TeaProvider::originsToMap($origins);

		foreach ($entities as $entity) {
			$path = $entity->tea->originId ? TeaProvider::getOriginPath(
				$originMap,
				$originsById[$entity->tea->originId],
			) : null;
			$tea = TeaProvider::hydrateResource($entity->tea, $path);
			$items->append(TeaSessionProvider::hydrate($entity, $tea));
		}

		return new TraversablePaginator($items, $currentPage, $itemsPerPage, $total);
	}
}
