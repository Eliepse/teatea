<?php

namespace App\State\CollectionTea;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\CollectionTea;
use App\Repository\MediaObjectRepository;
use App\Repository\OriginRepository;
use App\State\Hydration\CollectionTeaHydrator;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @implements ProviderInterface<CollectionTea|null>
 */
readonly class CollectionTeaProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private OriginRepository $originRepo,
		private MediaObjectRepository $mediaRepo,
		private CollectionTeaHydrator $hydrator,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): CollectionTea|null
	{
		assert(false === ($operation instanceof CollectionOperationInterface), "Collection operation not supported");
		assert(false === empty($uriVariables["username"]));

		$query = $this->em->createQuery(
			<<<DQL
			SELECT collection_tea, owner, tea, type, cultivar
			FROM App\Entity\CollectionTea collection_tea
				INNER JOIN collection_tea.owner owner WITH owner.username = :username
				LEFT JOIN collection_tea.tea tea
				LEFT JOIN tea.type type
				LEFT JOIN tea.cultivar cultivar
			WHERE collection_tea.id = :id
			DQL,
		);

		/** @var \App\Entity\CollectionTea|null $teaEntity */
		$teaEntity = $query
			->setParameter("id", $uriVariables["id"])
			->setParameter("username", $uriVariables["username"])
			->getOneOrNullResult();

		if (null === $teaEntity) {
			return null;
		}

		if (null !== $teaEntity->tea->origin) {
			$teaEntity->tea->origin = $this->originRepo->findWithAncestorNames($teaEntity->tea->origin->id);
		}

		$teaEntity->media = $this->mediaRepo->findByHasMedia($teaEntity);

		return $this->hydrator->hydrate($teaEntity);
	}
}
