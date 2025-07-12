<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\Drink;
use App\Entity\Tea;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * @implements ProcessorInterface<Drink>
 */
readonly class DrinkProcessor implements ProcessorInterface
{
	public function __construct(private EntityManagerInterface $em, private Security $security)
	{
	}

	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Drink
	{
		$user = $this->security->getUser();

		assert($data instanceof Drink);
		assert($user instanceof User);

		$this->em->persist(
			$entity = new \App\Entity\Drink(
				tea: $this->em->getReference(Tea::class, $data->tea->id),
				drinker: $user,
				drankAt: $data->drankAt,
			),
		);
		$this->em->flush();

		$drink = new Drink();
		$drink->id = $entity->id;
		$drink->drankAt = $entity->drankAt;

		// No need to fully load the Tea resource as it will only be serialized as IRI
		$drink->tea = new \App\ApiResource\Tea();
		$drink->tea->id = $entity->tea->id;

		return $drink;
	}
}
