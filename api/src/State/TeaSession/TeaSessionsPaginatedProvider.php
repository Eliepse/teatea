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
use App\Enum\BrewingQuality;
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

		$isContentful = $operation->getParameters()?->get("contentful")?->getValue() ?? false;
		$isContentful = !$isContentful instanceof ParameterNotFound;
		$currentPage = $this->pagination->getPage($context);
		$itemsPerPage = $this->pagination->getLimit($operation, $context);
		$offset = $this->pagination->getOffset($operation, $context);
		$username = $context["filters"]["username"] ?? null;
		$member = null !== $username ? $this->userRepo->findOneBy(["username" => $username]) : null;
		$teaId = $context["filters"]["tea"] ?? null;
		$tea = null !== $teaId ? $this->em->find(\App\Entity\Tea::class, $teaId) : null;

		if (null !== $teaId && null === $tea) {
			throw new NotFoundHttpException();
		}

		if (null !== $username && null === $member) {
			throw new NotFoundHttpException();
		}

		$expr = $this->em->createQueryBuilder()->expr();
		$sessionQb = $this->em
			->createQueryBuilder()
			->select("session", "tea", "type", "business")
			->from(\App\Entity\TeaSession::class, "session")
			->leftJoin("session.tea", "tea")
			->leftJoin("tea.type", "type")
			->leftJoin("session.place", "business")
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
			$sessionQb
				->andWhere("session.quality >= :quality")
				->andWhere("session.steeps IS NOT NULL AND JSON_ARRAY_LENGTH(session.steeps) > 0")
				->setParameter("quality", BrewingQuality::Improvable);
		}

		$total = (clone $sessionQb)->select("COUNT(session)")->resetDQLPart("orderBy")->getQuery(
		)->getSingleScalarResult();

		if (0 === $total) {
			return new TraversablePaginator(new ArrayCollection(), $currentPage, $itemsPerPage, $total);
		}

		/** @var TeaSession[] $entities */
		$entities = $sessionQb->setFirstResult($offset)->setMaxResults($itemsPerPage)->getQuery()->getResult();

		$items = new \ArrayIterator();

		$originsPath = Arr::pluck($entities, fn(\App\Entity\TeaSession $e) => $e->tea->originPath->getPath(), true);
		/** @var array<integer, \App\Entity\Origin> $entitiesById */
		$originsByPath = Arr::keyBy(
			$this->originRepo->findManyWithAncestorNames($originsPath),
			fn(\App\Entity\Origin $o) => $o->path->getPath(),
		);

		foreach ($entities as $entity) {
			$entity->tea->origin = $originsByPath[$entity->tea->originPath->getPath()] ?? null;
			$tea = TeaProvider::hydrateResource($entity->tea);
			$items->append(TeaSessionProvider::hydrate($entity, $tea));
		}

		return new TraversablePaginator($items, $currentPage, $itemsPerPage, $total);
	}
}
