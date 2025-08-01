<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\BrewingStep;
use App\ApiResource\Drink;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * @implements ProcessorInterface<BrewingStep>
 */
readonly class BrewingStepCreateProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
	) {
	}

	public function process(
		mixed $data,
		Operation $operation,
		array $uriVariables = [],
		array $context = [],
	): BrewingStep {
		$user = $this->security->getUser();

		assert($data instanceof BrewingStep);
		assert($user instanceof User);

		$drink = $this->em->find(\App\Entity\Drink::class, $uriVariables["drinkId"]);

		if (null === $drink) {
			throw new \RuntimeException("Could not find tea relation (teaId: {$data->tea->id}");
		}

		$data->index = $drink->addBrewingStep(\App\DTO\BrewingStep::fromResource($data), $data->index);

		$this->em->persist($drink);
		$this->em->flush();

		// Only used to let ApiPlatform generate the uri
		$data->drink = new Drink();
		$data->drink->id = $drink->id;

		return $data;
	}
}
