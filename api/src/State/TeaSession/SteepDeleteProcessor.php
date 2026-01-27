<?php

namespace App\State\TeaSession;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\Steep;
use App\ApiResource\TeaSession;
use App\Entity\User;
use App\Repository\TeaSessionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * @implements ProcessorInterface<TeaSession>
 */
readonly class SteepDeleteProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private TeaSessionRepository $repo,
		private Security $security,
	) {}

	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): void
	{
		$user = $this->security->getUser();

		assert($data instanceof Steep);
		assert($user instanceof User);

		/** @var \App\Entity\TeaSession|null $session */
		$session = $this->repo->find($data->session->id);

		if (null === $session) {
			throw new NotFoundHttpException();
		}

		// Only authors can delete
		if ($session->author->id !== $user->id) {
			throw new AccessDeniedHttpException();
		}

		$session->removeSteep($data->key);

		$this->em->persist($session);
		$this->em->flush();
	}
}
