<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\BrewingStep;
use App\ApiResource\Drink;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

readonly class BrewingStepProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
	{
		$user = $this->security->getUser();
		assert($user instanceof User);

		/** @var \App\Entity\Drink|null $drink */
		$drink = $this->em->createQueryBuilder()
			->select("drink")
			->from(\App\Entity\Drink::class, "drink")
			->where("drink.drinker = :drinker")->setParameter("drinker", $user)
			->andWhere("drink.id = :drinkId")->setParameter("drinkId", $uriVariables["drinkId"])
			->getQuery()->getSingleResult();

		if (null === $drink) {
			return null;
		}

		$id = $uriVariables["id"];
		$brewingStepDTO = $drink->getBrewingSteps()[$id - 1] ?? null;

		if (null === $brewingStepDTO) {
			return null;
		}

		$resource = new BrewingStep();
		$resource->index = $id;
		$resource->duration = $brewingStepDTO->duration->seconds;
		$resource->temperature = $brewingStepDTO->temperature->degrees;

		$resource->drink = new Drink();
		$resource->drink->id = $drink->id;

		return $resource;
	}
}
