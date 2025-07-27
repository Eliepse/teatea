<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\Drink;
use App\Entity\Tea;
use App\Entity\User;
use App\ValueObject\Weight;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * @implements ProcessorInterface<Drink>
 */
readonly class DrinkCreateProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
	) {
	}

	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Drink
	{
		$user = $this->security->getUser();

		assert($data instanceof Drink);
		assert($user instanceof User);

		$tea = $this->em->createQueryBuilder()
			->select("tea", "origin")
			->from(Tea::class, "tea")
			->leftJoin("tea.origin", "origin")
			->where("tea.id = :id")->setParameter("id", $data->tea->id)
			->setMaxResults(1)
			->getQuery()->getSingleResult();

		if (false === ($tea instanceof Tea)) {
			throw new \RuntimeException("Could not find tea relation (teaId: {$data->tea->id}");
		}

		$entity = new \App\Entity\Drink(
			tea: $tea,
			drinker: $user,
			technic: $data->technic,
			drankAt: $data->drankAt,
		);
		$entity->note = trim($data->note ?? "") ?: null;
		$entity->teaQuantity = empty($data->teaQuantity) ? null : Weight::fromGrams($data->teaQuantity);

		$this->em->persist($entity);
		$this->em->flush();


		$drink = new Drink();
		$drink->id = $entity->id;
		$drink->note = $entity->note;
		$drink->teaQuantity = $entity->teaQuantity?->toGrams();
		$drink->drankAt = $entity->drankAt;
		$drink->technic = $entity->technic;

		// No need to fully load the Tea resource as it will only be serialized as IRI
		$drink->tea = new \App\ApiResource\Tea();
		$drink->tea->id = $entity->tea->id;

		return $drink;
	}
}
