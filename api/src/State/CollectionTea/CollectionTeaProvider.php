<?php

namespace App\State\CollectionTea;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\CollectionTea;
use App\Repository\OriginRepository;
use App\State\Member\MemberProvider;
use App\State\Tea\TeaProvider;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @implements ProviderInterface<CollectionTea|null>
 */
readonly class CollectionTeaProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private OriginRepository $originRepo,
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

		return self::fromEntity($teaEntity);
	}

	public static function fromEntity(\App\Entity\CollectionTea $entity): CollectionTea
	{
		$tea = new CollectionTea();
		$tea->id = $entity->id;
		$tea->tea = TeaProvider::hydrateResource($entity->tea);
		$tea->owner = MemberProvider::hydrate($entity->owner);
		$tea->description = $entity->description;
		$tea->acquiredAt = $entity->acquiredAt;
		return $tea;
	}
}
