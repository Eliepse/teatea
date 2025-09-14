<?php

namespace App\State\Tea;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\Pagination\Pagination;
use ApiPlatform\State\Pagination\PaginatorInterface;
use ApiPlatform\State\Pagination\TraversablePaginator;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Tea;
use App\Entity\Origin;
use App\Helper\Arr;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * @implements ProviderInterface<Tea|null>
 */
readonly class ListedTeaCollectionProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private LoggerInterface $logger,
		private Pagination $paginator,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): PaginatorInterface
	{
		assert($operation instanceof CollectionOperationInterface, "Only supports collection operations");

		if (empty($username = $uriVariables["username"] ?? null)) {
			throw new NotFoundHttpException();
		}

		// Only support internal "tasted teas" list for now
		if ("_tasted" !== $uriVariables["slug"]) {
			throw new NotFoundHttpException();
		}

		$member = $this->em
			->createQuery("SELECT u FROM App\Entity\User u WHERE u.username = :username")
			->setParameter("username", $username)
			->getSingleResult();

		$current = $this->paginator->getPage($context);
		$offset = $this->paginator->getOffset($operation, $context);
		$limit = $this->paginator->getLimit($operation, $context);

		$teaIdsQb = $this->em->getConnection()
			->createQueryBuilder()
			->from("tea_session", "session")
			->where("session.author_id = :authorId")
			->setParameter("authorId", $member->id);

		$total = (clone $teaIdsQb)
			->select("COUNT(DISTINCT session.tea_id)")
			->fetchOne() ?: 0;

		if (0 === $total) {
			return new TraversablePaginator(new ArrayCollection(), 1, $limit, $total);
		}

		$teaIds = (clone $teaIdsQb)
			->select("session.tea_id")
			->groupBy("session.tea_id")
			->orderBy("MIN(session.drank_at)", "DESC")
			->setFirstResult($offset)
			->setMaxResults($limit)
			->fetchFirstColumn();

		$teas = $this->em->createQueryBuilder()
			->select("tea", "type", "origin")
			->from(\App\Entity\Tea::class, "tea")
			->leftJoin("tea.type", "type")
			->leftJoin("tea.origin", "origin")
			->where("tea.id IN (:ids)")
			->setParameter("ids", $teaIds, ArrayParameterType::INTEGER)
			->getQuery()
			->getResult();

		$teasById = Arr::keyBy($teas, "id");

		$originsQb = $this->em->createQueryBuilder()
			->select("origin")
			->from(Origin::class, "origin");

		/** @var array<string, Origin> $originsMap */
		$originsMap = TeaProvider::originsToMap($originsQb->getQuery()->getResult());

		$resources = new ArrayCollection();

		// Iterate over search results to keep the right ordering
		foreach ($teaIds as $teaId) {
			if (null === ($tea = $teasById[$teaId] ?? null)) {
				$this->logger->warning("Couldn't hydrate a tea: not found in list", ["teaId" => $teaId]);
				continue;
			}

			$originNodes = TeaProvider::getOriginPath($originsMap, $tea->origin);
			$resources->add(TeaProvider::hydrateResource($tea, $originNodes));
		}

		return new TraversablePaginator($resources, $current, $limit, $total);
	}
}
