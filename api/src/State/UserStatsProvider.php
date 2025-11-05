<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\ActivityGraph;
use App\Entity\Origin;
use App\Entity\User;
use App\Helper\Arr;
use App\State\Member\MemberProvider;
use App\State\Tea\TeaProvider;
use App\State\TeaType\TeaTypeProvider;
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * @implements ProviderInterface<ActivityGraph|null>
 */
readonly class UserStatsProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
	) {
	}

	public function provide(
		Operation $operation,
		array $uriVariables = [],
		array $context = [],
	): array|null|object {
		$user = $this->security->getUser();
		assert($user instanceof User);

		$sessions = $this->em
			->createQuery("SELECT COUNT(session) FROM App\Entity\TeaSession session WHERE session.author = :user")
			->setParameter("user", $user)
			->getOneOrNullResult(AbstractQuery::HYDRATE_SINGLE_SCALAR);

		$teas = $this->em
			->createQuery(
				<<<DQL
				SELECT COUNT(DISTINCT tea.id)
				FROM App\Entity\Tea tea
					INNER JOIN tea.sessions session
				WHERE session.author = :user
				DQL,
			)
			->setParameter("user", $user)
			->getOneOrNullResult(AbstractQuery::HYDRATE_SINGLE_SCALAR);

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


		$teasOrigins = $this->em->createQuery(
			<<<DQL
			SELECT origin
			FROM App\Entity\Origin origin
				LEFT JOIN App\Entity\Origin o WITH IS_CONTAINED_BY(o.path, origin.path) = TRUE AND o.id IN (:ids)
			WHERE o.id IS NOT NULL
			DQL
		)
		->setParameter("ids", Arr::pluck($topTeas, fn($t) => $t->origin?->id, true), ArrayParameterType::INTEGER)
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

		return $resource;
	}
}
