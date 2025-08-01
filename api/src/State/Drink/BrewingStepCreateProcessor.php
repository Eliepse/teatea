<?php

namespace App\State\Drink;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\BrewingStep;
use App\ApiResource\Drink;
use App\Entity\User;
use App\Repository\DrinkRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * @implements ProcessorInterface<BrewingStep>
 */
readonly class BrewingStepCreateProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private DrinkRepository $drinkRepository,
		private Security $security,
	) {
	}

	public function process(
		mixed $data,
		Operation $operation,
		array $uriVariables = [],
		array $context = [],
	): ?BrewingStep {
		$user = $this->security->getUser();

		assert($data instanceof BrewingStep);
		assert($user instanceof User);

		/** @var \App\Entity\Drink|null $drink */
		$drink = $this->drinkRepository->createQueryBuilder("drink")
			->where("drink.drinker = :drinker")->setParameter("drinker", $user)
			->andWhere("drink.id = :drinkId")->setParameter("drinkId", $uriVariables["drinkId"])
			->getQuery()->getSingleResult();

		if (null === $drink) {
			return null;
		}

		$index = $drink->addBrewingStep(\App\DTO\BrewingStep::fromResource($data));

		$this->em->persist($drink);
		$this->em->flush();

		$resource = new BrewingStep($index);
		$resource->temperature = $data->temperature;
		$resource->duration = $data->duration;

		// Only used to let ApiPlatform generate the uri
		$resource->drink = new Drink();
		$resource->drink->id = $drink->id;

		return $resource;
	}
}
