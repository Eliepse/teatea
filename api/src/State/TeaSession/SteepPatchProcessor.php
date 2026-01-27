<?php

namespace App\State\TeaSession;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\Steep;
use App\DTO\SteepValue;
use App\Entity\User;
use App\Repository\TeaSessionRepository;
use App\ValueObject\Duration;
use App\ValueObject\Temperature;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * @implements ProcessorInterface<Steep>
 */
readonly class SteepPatchProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private TeaSessionRepository $sessionRepository,
		private Security $security,
	) {}

	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): ?Steep
	{
		$user = $this->security->getUser();

		assert($data instanceof Steep);
		assert($user instanceof User);

		/** @var \App\Entity\TeaSession|null $session */
		$session = $this->sessionRepository->find($data->session->id);

		if (null === $session) {
			throw new NotFoundHttpException();
		}

		if ($user->id !== $session->author->id) {
			throw new AccessDeniedHttpException();
		}

		$session->persistSteep(
			$steep = new SteepValue(
				$data->key,
				new Duration($data->duration),
				null !== $data->temperature ? new Temperature($data->temperature) : null,
			),
		);

		$this->em->persist($session);
		$this->em->flush();

		return SteepProvider::hydrate($steep, $session);
	}
}
