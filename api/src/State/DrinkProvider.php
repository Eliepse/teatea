<?php

namespace App\State;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Drink;
use App\ApiResource\Tea;
use App\Repository\OriginRepository;
use Doctrine\ORM\EntityManagerInterface;

readonly class DrinkProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private OriginRepository $originRepository,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
	{
		$drinkQb = $this->em->createQueryBuilder()
			->select("drink", "tea", "type", "origin")
			->from(\App\Entity\Drink::class, "drink")
			->leftJoin("drink.tea", "tea")
			->leftJoin("tea.type", "type")
			->leftJoin("tea.origin", "origin")
			->orderBy("drink.drankAt", "DESC");


		if ($operation instanceof CollectionOperationInterface) {
			$originMap = TeaProvider::originsToMap($this->originRepository->fetchOriginsFromDrink());

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
			->where("drink.id = :drinkId")
			->setParameter("drinkId", $uriVariables["id"])
			->getQuery()->getSingleResult();

		$originMap = TeaProvider::originsToMap($origins);
		$path = TeaProvider::getOriginPath($originMap, $entity->tea->origin);
		$tea = TeaProvider::hydrateResource($entity->tea, $path);

		return self::hydrate($entity, $tea);
	}

	public static function hydrate(\App\Entity\Drink $entity, Tea $tea): Drink
	{
		$resource = new Drink();
		$resource->id = $entity->id;
		$resource->note = $entity->note;
		$resource->technic = $entity->technic;
		$resource->teaQuantity = $entity->teaQuantity?->toGrams();
		$resource->waterMl = $entity->waterVolume?->toMl();
		$resource->drankAt = $entity->drankAt;
		$resource->tea = $tea;

		return $resource;
	}
}
