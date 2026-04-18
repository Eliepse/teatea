<?php

namespace App\State\TeaSession;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\TeaSession;
use App\DTO\SteepValue;
use App\Entity\Tea;
use App\Repository\OriginRepository;
use App\State\Tea\TeaProvider;
use App\ValueObject\Volume;
use App\ValueObject\Weight;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @implements ProcessorInterface<TeaSession>
 */
readonly class TeaSessionEditProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private OriginRepository $originRepository,
	) {
	}

	public function process(
		mixed $data,
		Operation $operation,
		array $uriVariables = [],
		array $context = [],
	): TeaSession {
		assert($data instanceof TeaSession);

		$entity = $this->em->find(\App\Entity\TeaSession::class, $data->id);
		$entity->note = trim($data->note ?? "") ?: null;
		$entity->teaQuantity = empty($data->teaQuantity) ? null : Weight::fromGrams($data->teaQuantity);
		$entity->waterVolume = empty($data->waterMl) ? null : Volume::fromMl($data->waterMl);
		$entity->quality = $data->quality;
		$entity->place = $data->place ? $this->em->getReference(\App\Entity\Business::class, $data->place->id) : null;
		// TODO(elie): Find a way to have SteepValue array to be auto hydrated in Resource
		$entity->setSteeps(
			array_map(
				fn($st) => new SteepValue($st["duration"], $st["temperature"] ?? null),
				$data->steeps,
			),
		);
		$this->em->persist($entity);
		$this->em->flush();

		$tea = $this->em
			->createQueryBuilder()
			->select("tea", "origin")
			->from(Tea::class, "tea")
			->leftJoin("tea.origin", "origin")
			->where("tea.id = :id")
			->setParameter("id", $data->tea->id)
			->setMaxResults(1)
			->getQuery()
			->getSingleResult();

		if (false === $tea instanceof Tea) {
			throw new \RuntimeException("Could not find tea relation (teaId: {$data->tea->id}");
		}

		$origins = $this->originRepository->fetchOriginsFromSession(fn($qb) => $qb->andWhere(
			"session.id = :sessionId",
		)->setParameter("sessionId", $entity->id));
		$originMap = TeaProvider::originsToMap($origins);
		$teaResource = TeaProvider::hydrateResource($tea, TeaProvider::getOriginPath($originMap, $tea->origin));

		return TeaSessionProvider::hydrate($entity, $teaResource);
	}
}
