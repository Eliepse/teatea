<?php

namespace App\State\TeaSession;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\BrewingStep;
use App\ApiResource\TeaSession;
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

		/** @var \App\Entity\TeaSession|null $session */
		$session = $this->em->createQueryBuilder()
			->select("session")
			->from(\App\Entity\TeaSession::class, "session")
			->where("session.author = :author")->setParameter("author", $user)
			->andWhere("session.id = :sessionId")->setParameter("sessionId", $uriVariables["sessionId"])
			->getQuery()->getSingleResult();

		if (null === $session) {
			return null;
		}

		$id = $uriVariables["id"];
		$brewingStepDTO = $session->getBrewingStepsMap()[$id] ?? null;

		if (null === $brewingStepDTO) {
			return null;
		}

		$resource = new BrewingStep($id);
		$resource->duration = $brewingStepDTO->duration->seconds;
		$resource->temperature = $brewingStepDTO->temperature->degrees;

		$resource->session = new TeaSession();
		$resource->session->id = $session->id;

		return $resource;
	}
}
