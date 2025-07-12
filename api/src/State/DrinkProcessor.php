<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\Drink;
use App\Entity\Tea;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @implements ProcessorInterface<Drink>
 */
readonly class DrinkProcessor implements ProcessorInterface
{
	public function __construct(private EntityManagerInterface $em)
	{
	}

	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Drink
	{
		assert($data instanceof Drink);

		$this->em->persist(
			$entity = new \App\Entity\Drink(
				$this->em->getReference(Tea::class, $data->tea->id),
				$data->drankAt,
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
