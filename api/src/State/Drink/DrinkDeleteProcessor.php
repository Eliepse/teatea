<?php

namespace App\State\Drink;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\Drink;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * @implements ProcessorInterface<Drink>
 */
readonly class DrinkDeleteProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
	) {
	}

	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): void
	{
		$user = $this->security->getUser();

		assert($data instanceof Drink);
		assert($user instanceof User);

		$entity = $this->em->find(\App\Entity\Drink::class, $data->id);

		// Only author can delete
		assert($entity->drinker->id === $user->id);

		$this->em->remove($entity);
		$this->em->flush();
	}
}
