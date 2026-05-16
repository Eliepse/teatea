<?php

namespace App\State\TeaSession;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\TeaSession;
use App\Entity\CollectionTea;
use App\Entity\Tea;
use App\Entity\User;
use App\ValueObject\Volume;
use App\ValueObject\Weight;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * @implements ProcessorInterface<TeaSession>
 */
readonly class TeaSessionCreateProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
	) {
	}

	public function process(
		mixed $data,
		Operation $operation,
		array $uriVariables = [],
		array $context = [],
	): TeaSession {
		$user = $this->security->getUser();

		assert($data instanceof TeaSession);
		assert($user instanceof User);

		$collecTeaId = $data->collectionTea?->id;
		$collectionTea = $collecTeaId ? $this->em->find(CollectionTea::class, $collecTeaId) : null;
		$tea = $collectionTea?->tea ?? $this->em->find(Tea::class, $data->tea->id);

		if (!$tea instanceof Tea) {
			throw new \RuntimeException("Could not find tea relation (teaId: {$data->tea->id}");
		}

		if ($collecTeaId && !$collectionTea instanceof CollectionTea) {
			throw new \RuntimeException("Could not find collection tea relation (collectionTeaId: $collecTeaId");
		}

		$entity = new \App\Entity\TeaSession($tea, $user, $data->drankAt);
		$entity->note = trim($data->note ?? "") ?: null;
		$entity->teaQuantity = empty($data->teaQuantity) ? null : Weight::fromGrams($data->teaQuantity);
		$entity->waterVolume = empty($data->waterMl) ? null : Volume::fromMl($data->waterMl);
		$entity->collectionTea = $collectionTea;
		$entity->brewingType = $data->brewingType;

		$this->em->persist($entity);
		$this->em->flush();

		return TeaSessionProvider::hydrate($entity);
	}
}
