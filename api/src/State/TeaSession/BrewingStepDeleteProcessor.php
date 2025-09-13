<?php

namespace App\State\TeaSession;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\BrewingStep;
use App\ApiResource\TeaSession;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * @implements ProcessorInterface<TeaSession>
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

		$session = $this->em->find(\App\Entity\TeaSession::class, $data->session->id);

		// Only author can delete
		assert($session->author->id === $user->id);

		// Remove the step
		if (false === $session->removeBrewingStep($uriVariables["id"])) {
			throw new \RuntimeException("Failed to remove the step");
		}

		$this->em->persist($session);
		$this->em->flush();
	}
}
