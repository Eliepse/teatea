<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\ActivityGraph;
use App\ApiResource\Member;
use App\DTO\Stats\TeaFamilyAmount;
use App\Entity\Origin;
use App\Entity\User;
use App\Enum\TeaFamily;
use App\Helper\Arr;
use App\State\Member\MemberProvider;
use App\State\Tea\TeaProvider;
use App\State\TeaType\TeaTypeProvider;
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @implements ProviderInterface<ActivityGraph|null>
 */
readonly class UserStatsProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
	) {}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): ?Member
	{
		$user = $this->em
			->createQuery("SELECT u FROM App\Entity\User u WHERE u.username = :username")
			->setParameter("username", $uriVariables["username"])
			->getSingleResult();

		if (!$user instanceof User) {
			return null;
		}

		$sessions = $this->em
			->createQuery("SELECT COUNT(session) FROM App\Entity\TeaSession session WHERE session.author = :user")
			->setParameter("user", $user)
			->getOneOrNullResult(AbstractQuery::HYDRATE_SINGLE_SCALAR);

		$teas = $this->em
			->createQuery(<<<DQL
				SELECT COUNT(DISTINCT tea.id)
				FROM App\Entity\Tea tea
					INNER JOIN tea.sessions session
				WHERE session.author = :user
				DQL)
			->setParameter("user", $user)
			->getOneOrNullResult(AbstractQuery::HYDRATE_SINGLE_SCALAR);

		$topTeas = $this->em
			->createQuery(<<<DQL
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
				DQL)
			->setParameter("user", $user)
			->setParameter("before", new \DateTimeImmutable()->sub(new \DateInterval("P1M"))->setTime(0, 0))
			->setMaxResults(3)
			->getResult();

		$topTeaTypes = $this->em
			->createQuery(<<<DQL
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
				DQL)
			->setParameter("user", $user)
			->setParameter("before", new \DateTimeImmutable()->sub(new \DateInterval("P1M"))->setTime(0, 0))
			->setMaxResults(3)
			->getResult();

		$familyStats = $this->em
			->createQuery(<<<DQL
				SELECT tea.family, count(session) as count
				FROM App\Entity\TeaSession session
					LEFT JOIN session.tea tea
				WHERE session.author = :author
				  AND session.drankAt >= :fromDrankAt
				GROUP BY tea.family
				DQL)
			->setParameter("author", $user)
			->setParameter("fromDrankAt", new \DateTimeImmutable()->sub(new \DateInterval("P1M"))->setTime(0, 0))
			->getResult();

		$originsPath = Arr::pluck($topTeas, fn(\App\Entity\Tea $t) => $t->originPath->getPath(), true);
		$teasOrigins = $this->em
			->createQuery(<<<DQL
				SELECT origin
				FROM App\Entity\Origin origin
					LEFT JOIN App\Entity\Origin o ON IS_CONTAINED_BY(o.path, origin.path) = TRUE AND o.path IN (:paths)
				WHERE o.path IS NOT NULL
				DQL)
			->setParameter("paths", $originsPath, ArrayParameterType::STRING)
			->getResult();

		$resource = MemberProvider::hydrate($user);
		$resource->statsSessionsTotal = $sessions ?: 0;
		$resource->statsConsumedTeasTotal = $teas ?: 0;

		/** @var array<string, Origin> $originsMap */
		$originsMap = TeaProvider::originsToMap($teasOrigins);

		$teas = [];

		foreach ($topTeas as $teaEntity) {
			$originNodes = TeaProvider::getOriginPath($originsMap, $teaEntity->origin);
			$teas[] = TeaProvider::hydrateResource($teaEntity, $originNodes);
		}

		$resource->statsTopTeas = $teas;
		$resource->statsTopTeaTypes = array_map(fn($t) => TeaTypeProvider::fromEntity($t), $topTeaTypes);

		$resource->statsFamilies = array_map(
			fn($row) => new TeaFamilyAmount($row["family"], $row["count"] ?? 0),
			$familyStats,
		);

		return $resource;
	}
}
