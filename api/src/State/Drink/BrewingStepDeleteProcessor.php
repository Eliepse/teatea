<?php

namespace App\State\Drink;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\BrewingStep;
use App\ApiResource\Drink;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * @implements ProcessorInterface<Drink>
 */
readonly class BrewingStepDeleteProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
	) {
	}

	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): void
	{
		$user = $this->security->getUser();

		assert($data instanceof BrewingStep);
		assert($user instanceof User);

		$drink = $this->em->find(\App\Entity\Drink::class, $data->drink->id);

		// Only author can delete
		assert($drink->drinker->id === $user->id);

		// Remove the step
		if (false === $drink->removeBrewingStep($uriVariables["id"])) {
			throw new \RuntimeException("Failed to remove the step");
		}

		$this->em->persist($drink);
		$this->em->flush();
	}
}
