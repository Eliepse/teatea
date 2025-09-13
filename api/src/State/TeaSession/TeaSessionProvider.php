<?php

namespace App\State\TeaSession;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\BrewingStep;
use App\ApiResource\Tea;
use App\ApiResource\TeaSession;
use App\Entity\User;
use App\Repository\OriginRepository;
use App\State\Tea\TeaProvider;
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

readonly class TeaSessionProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private OriginRepository $originRepository,
		private Security $security,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
	{
		$user = $this->security->getUser();
		assert($user instanceof User);

		$cursor = $context["filters"]["cursor"] ?? null;
		$cursor = $cursor ? \DateTimeImmutable::createFromFormat("Y-m-d", $cursor)->setTime(0, 0) : null;
		$limit = $context["filters"]["limit"] ?? 1;
		$limit = is_numeric($limit) ? max(1, min(31, intval($limit))) : null;

		assert(false !== $cursor);

		$sessionQb = $this->em->createQueryBuilder()
			->select("session", "tea", "type", "origin")
			->from(\App\Entity\TeaSession::class, "session")
			->leftJoin("session.tea", "tea")
			->leftJoin("tea.type", "type")
			->leftJoin("tea.origin", "origin")
			->where("session.author = :author")->setParameter("author", $user)
			->orderBy("session.drankAt", "DESC");

		if ($operation instanceof CollectionOperationInterface) {
			// Fetch sessions for a fixed amount of days
			$searchQb = $this->em->getConnection()->createQueryBuilder()
				->select("array_agg(id) AS ids")
				->from("tea_session")
				->where("author_id = :authorId")->setParameter("authorId", $user->id)
				->groupBy("drank_at::date")
				->orderBy("drank_at::date", "DESC")
				->setMaxResults($limit);

			if ($cursor) {
				$searchQb->andWhere("drank_at <= :cursor")->setParameter("cursor", $cursor->format("Y-m-d"));
			}

			$sessionIds = [];

			foreach ($searchQb->fetchAllAssociative() as $row) {
				array_push($sessionIds, ...array_map("intval", explode(",", substr($row["ids"], 1, -1))));
			}

			$sessionIds = array_unique($sessionIds);

			if (empty($sessionIds)) {
				return [];
			}

			$sessionQb->andWhere("session.id IN (:sessionIds)")
				->setParameter("sessionIds", $sessionIds, ArrayParameterType::INTEGER);

			// TODO(elie): optimize to only fetch origins of requested sessions/teas
			$origins = $this->originRepository->fetchOriginsFromSession(
				fn($qb) => $qb->where("session.author = :author")->setParameter("author", $user),
			);

			$originMap = TeaProvider::originsToMap($origins);

			return array_map(function (\App\Entity\TeaSession $entity) use ($originMap) {
				$path = TeaProvider::getOriginPath($originMap, $entity->tea->origin);
				$tea = TeaProvider::hydrateResource($entity->tea, $path);
				return self::hydrate($entity, $tea);
			}, $sessionQb->getQuery()->getResult());
		}

		$origins = $this->originRepository->fetchOriginsFromSession(
			fn($qb) => $qb->where("session.id = :sessionId")->setParameter("sessionId", $uriVariables["id"]),
		);

		$entity = $sessionQb
			->andWhere("session.id = :sessionId")
			->setParameter("sessionId", $uriVariables["id"])
			->getQuery()->getSingleResult();

		$originMap = TeaProvider::originsToMap($origins);
		$path = TeaProvider::getOriginPath($originMap, $entity->tea->origin);
		$tea = TeaProvider::hydrateResource($entity->tea, $path);

		return self::hydrate($entity, $tea);
	}

	public static function hydrate(\App\Entity\TeaSession $entity, ?Tea $tea = null): TeaSession
	{
		$resource = new TeaSession();
		$resource->id = $entity->id;
		$resource->note = $entity->note;
		$resource->technic = $entity->technic;
		$resource->teaQuantity = $entity->teaQuantity?->toGrams();
		$resource->waterMl = $entity->waterVolume?->toMl();
		$resource->drankAt = $entity->drankAt;

		$brewingSteps = $entity->getBrewingStepsMap();

		if (0 !== count($brewingSteps)) {
			$resource->brewingSteps = array_map(
				function (\App\DTO\BrewingStep $bs, int $i) use ($resource) {
					$r = new BrewingStep();
					$r->id = $i;
					$r->duration = $bs->duration->seconds;
					$r->temperature = $bs->temperature->degrees;
					$r->session = $resource;
					return $r;
				},
				$brewingSteps,
				array_keys($brewingSteps),
			);
		}

		if ($tea) {
			$resource->tea = $tea;
		}

		return $resource;
	}
}
