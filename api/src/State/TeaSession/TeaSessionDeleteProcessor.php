<?php

namespace App\State\TeaSession;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\TeaSession;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * @implements ProcessorInterface<TeaSession>
 */
readonly class TeaSessionDeleteProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
	) {}

	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): void
	{
		$user = $this->security->getUser();

		assert($data instanceof TeaSession);
		assert($user instanceof User);

		$entity = $this->em->find(\App\Entity\TeaSession::class, $data->id);

		// Only author can delete
		assert($entity->author->id === $user->id);

		$this->em->remove($entity);
		$this->em->flush();
	}
}
