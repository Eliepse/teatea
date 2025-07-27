<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\Drink;
use App\Entity\Tea;
use App\Repository\OriginRepository;
use App\ValueObject\Weight;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @implements ProcessorInterface<Drink>
 */
readonly class DrinkEditProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private OriginRepository $originRepository,
	) {
	}

	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Drink
	{
		assert($data instanceof Drink);

		$entity = $this->em->find(\App\Entity\Drink::class, $data->id);
		$entity->note = $data->note;
		$entity->teaQuantity = empty($data->teaQuantity) ? null : Weight::fromGrams($data->teaQuantity);
		$this->em->persist($entity);
		$this->em->flush();

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

		$origins = $this->originRepository->fetchOriginsFromDrink(
			fn($qb) => $qb->andWhere("drink.id = :drinkId")->setParameter("drinkId", $entity->id),
		);
		$originMap = TeaProvider::originsToMap($origins);
		$teaResource = TeaProvider::hydrateResource($tea, TeaProvider::getOriginPath($originMap, $tea->origin));

		return DrinkProvider::hydrate($entity, $teaResource);
	}
}
