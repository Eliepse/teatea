<?php

namespace App\State\TeaSession;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\BrewingStep;
use App\ApiResource\TeaSession;
use App\Entity\User;
use App\Repository\TeaSessionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * @implements ProcessorInterface<BrewingStep>
 */
readonly class BrewingStepCreateProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private TeaSessionRepository $sessionRepository,
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

		/** @var \App\Entity\TeaSession|null $session */
		$session = $this->sessionRepository->createQueryBuilder("session")
			->where("session.author = :author")->setParameter("author", $user)
			->andWhere("session.id = :sessionId")->setParameter("sessionId", $uriVariables["sessionId"])
			->getQuery()->getSingleResult();

		if (null === $session) {
			return null;
		}

		$index = $session->addBrewingStep(\App\DTO\BrewingStep::fromResource($data));

		$this->em->persist($session);
		$this->em->flush();

		$resource = new BrewingStep($index);
		$resource->temperature = $data->temperature;
		$resource->duration = $data->duration;

		// Only used to let ApiPlatform generate the uri
		$resource->session = new TeaSession();
		$resource->session->id = $session->id;

		return $resource;
	}
}
