<?php

namespace App\State\Drink;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\BrewingStep;
use App\ApiResource\Drink;
use App\ApiResource\Tea;
use App\Entity\User;
use App\Helper\Arr;
use App\Repository\OriginRepository;
use App\State\Tea\TeaProvider;
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

readonly class DrinkProvider implements ProviderInterface
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

		$drinkQb = $this->em->createQueryBuilder()
			->select("drink", "tea", "type", "origin")
			->from(\App\Entity\Drink::class, "drink")
			->leftJoin("drink.tea", "tea")
			->leftJoin("tea.type", "type")
			->leftJoin("tea.origin", "origin")
			->where("drink.drinker = :drinker")->setParameter("drinker", $user)
			->orderBy("drink.drankAt", "DESC");

		if ($operation instanceof CollectionOperationInterface) {
			// Fetch drinks for a fixed amount of days
			$searchQb = $this->em->getConnection()->createQueryBuilder()
				->select("array_agg(id) AS ids")
				->from("drink")
				->where("drinker_id = :drinkerId")->setParameter("drinkerId", $user->id)
				->groupBy("drank_at::date")
				->orderBy("drank_at::date", "DESC")
				->setMaxResults($limit);

			if ($cursor) {
				$searchQb->andWhere("drank_at <= :cursor")->setParameter("cursor", $cursor->format("Y-m-d"));
			}

			$drinkIds = [];

			foreach ($searchQb->fetchAllAssociative() as $row) {
				array_push($drinkIds, ...array_map("intval", explode(",", substr($row["ids"], 1, -1))));
			}

			$drinkIds = array_unique($drinkIds);

			if(empty($drinkIds)) {
				return [];
			}

			$drinkQb->andWhere("drink.id IN (:drinkIds)")
				->setParameter("drinkIds", $drinkIds, ArrayParameterType::INTEGER);

			// TODO(elie): optimize to only fetch origins of requested drinks/teas
			$origins = $this->originRepository->fetchOriginsFromDrink(
				fn($qb) => $qb->where("drink.drinker = :drinker")->setParameter("drinker", $user),
			);

			$originMap = TeaProvider::originsToMap($origins);

			return array_map(function (\App\Entity\Drink $entity) use ($originMap) {
				$path = TeaProvider::getOriginPath($originMap, $entity->tea->origin);
				$tea = TeaProvider::hydrateResource($entity->tea, $path);
				return self::hydrate($entity, $tea);
			}, $drinkQb->getQuery()->getResult());
		}

		$origins = $this->originRepository->fetchOriginsFromDrink(
			fn($qb) => $qb->where("drink.id = :drinkId")->setParameter("drinkId", $uriVariables["id"]),
		);

		$entity = $drinkQb
			->andWhere("drink.id = :drinkId")
			->setParameter("drinkId", $uriVariables["id"])
			->getQuery()->getSingleResult();

		$originMap = TeaProvider::originsToMap($origins);
		$path = TeaProvider::getOriginPath($originMap, $entity->tea->origin);
		$tea = TeaProvider::hydrateResource($entity->tea, $path);

		return self::hydrate($entity, $tea);
	}

	public static function hydrate(\App\Entity\Drink $entity, ?Tea $tea = null): Drink
	{
		$resource = new Drink();
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
					$r->drink = $resource;
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
