<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\ActivityGraph;
use App\ApiResource\Member;
use App\Entity\Tea as TeaEntity;
use App\Entity\User;
use App\Helper\Arr;
use App\Repository\OriginRepository;
use App\State\Member\MemberProvider;
use App\State\Tea\TeaProvider;
use App\State\TeaType\TeaTypeProvider;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @implements ProviderInterface<ActivityGraph|null>
 */
readonly class UserStatsProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private OriginRepository $originRepo,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): ?Member
	{
		$user = $this->em
			->createQuery("SELECT u FROM App\Entity\User u WHERE u.username = :username")
			->setParameter("username", $uriVariables["username"])
			->getSingleResult();

		if (!$user instanceof User) {
			return null;
		}

		$resource = MemberProvider::hydrate($user);

		/** @var array{ total?: int, weight?: float } $totalSessionStats */
		$totalSessionStats = $this->em
			->createQuery(
				<<<DQL
				SELECT COUNT(session) as total, SUM(session.teaQuantity) as weight
				FROM App\Entity\TeaSession session
				WHERE session.author = :user
				DQL,
			)
			->setParameter("user", $user)
			->getOneOrNullResult(AbstractQuery::HYDRATE_SCALAR) ?: [];

		$resource->statsSessionsTotal = $totalSessionStats["total"] ?? 0;
		$resource->statsConsumedTeaKgTotal = $totalSessionStats["weight"] ?? 0;

		$resource->statsConsumedTeasTotal = $this->em
			->createQuery(
				<<<DQL
				SELECT COUNT(DISTINCT tea.id)
				FROM App\Entity\Tea tea
					INNER JOIN tea.sessions session
				WHERE session.author = :user
				DQL,
			)
			->setParameter("user", $user)
			->getOneOrNullResult(AbstractQuery::HYDRATE_SINGLE_SCALAR) ?: 0;

		/** @var TeaEntity[] $topTeas */
		$topTeas = $this->em
			->createQuery(
				<<<DQL
				SELECT tea, type
				FROM App\Entity\Tea tea
					LEFT JOIN tea.type type
				WHERE tea.id IN (
					SELECT searchTea.id
					FROM App\Entity\Tea searchTea
						INNER JOIN searchTea.sessions session WITH session.drankAt >= :before AND session.author = :user
					GROUP BY searchTea.id
					ORDER BY COUNT(session) DESC
				)
				DQL,
			)
			->setParameter("user", $user)
			->setParameter("before", new \DateTimeImmutable()->sub(new \DateInterval("P1M"))->setTime(0, 0))
			->setMaxResults(3)
			->getResult();

		$topTeaTypes = $this->em
			->createQuery(
				<<<DQL
				SELECT type
				FROM App\Entity\TeaType type
				WHERE type.id IN (
					SELECT searchType.id
					FROM App\Entity\TeaType searchType
						INNER JOIN searchType.teas teas
						INNER JOIN teas.sessions sessions WITH sessions.drankAt >= :before AND sessions.author = :user
					GROUP BY searchType.id
					ORDER BY COUNT(sessions) DESC
				)
				DQL,
			)
			->setParameter("user", $user)
			->setParameter("before", new \DateTimeImmutable()->sub(new \DateInterval("P1M"))->setTime(0, 0))
			->setMaxResults(3)
			->getResult();

		$originsPath = array_filter(Arr::pluck($topTeas, fn(TeaEntity $t) => $t->originPath?->getPath(), true));
		$originsByPath = Arr::keyBy($this->originRepo->findManyWithAncestorNames($originsPath), "path");

		$teas = [];

		foreach ($topTeas as $teaEntity) {
			if ($teaEntity->originPath) {
				$teaEntity->origin = $originsByPath[$teaEntity->originPath->getPath()] ?? null;
			}

			$teas[] = TeaProvider::hydrateResource($teaEntity);
		}

		$resource->statsTopTeas = $teas;
		$resource->statsTopTeaTypes = array_map(fn($t) => TeaTypeProvider::fromEntity($t), $topTeaTypes);

		return $resource;
	}
}
