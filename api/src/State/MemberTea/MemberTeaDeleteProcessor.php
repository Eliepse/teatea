<?php

namespace App\State\MemberTea;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\MemberTea;
use App\Entity\TeaListPivot;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * @implements ProcessorInterface<MemberTea>
 */
readonly class MemberTeaDeleteProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
	) {}

	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): void
	{
		assert($data instanceof MemberTea);

		$user = $this->security->getUser();
		assert($user instanceof User);

		// Only authors can delete
		if ($data->author->id !== $user->id) {
			throw new AccessDeniedHttpException();
		}

		if (null === ($pivot = $this->em->find(TeaListPivot::class, $data->id))) {
			throw new NotFoundHttpException();
		}

		$this->em->remove($pivot);
		$this->em->flush();
	}
}
