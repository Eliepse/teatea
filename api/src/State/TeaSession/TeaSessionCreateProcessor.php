<?php

namespace App\State\TeaSession;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\TeaSession;
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

		$entity = new \App\Entity\TeaSession($tea, $user, $data->drankAt);
		$entity->note = trim($data->note ?? "") ?: null;
		$entity->teaQuantity = empty($data->teaQuantity) ? null : Weight::fromGrams($data->teaQuantity);
		$entity->waterVolume = empty($data->waterMl) ? null : Volume::fromMl($data->waterMl);

		$this->em->persist($entity);
		$this->em->flush();

		return TeaSessionProvider::hydrate($entity);
	}
}
