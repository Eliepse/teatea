<?php

namespace App\State\Tea;

use ApiPlatform\Metadata\Exception\ItemNotFoundException;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\Tea;
use App\Entity\User;
use App\Repository\TeaRepository;
use App\State\OriginProvider;
use App\State\TeaType\TeaTypeProvider;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Exception\ORMException;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;

readonly class TeaCreateFromTypeProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private TeaRepository $repository,
		private Security $security,
	) {
	}

	/**
	 * @param mixed|Tea $data
	 * @param Operation $operation
	 * @param array $uriVariables
	 * @param array $context
	 *
	 * @return mixed
	 * @throws ORMException
	 */
	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
	{
		$user = $this->security->getUser();
		/** @var \App\Entity\TeaType $typeEntity */
		$typeEntity = $this->em->createQueryBuilder()
			->select("type", "origin")
			->from(\App\Entity\TeaType::class, "type")
			->leftJoin("type.origin", "origin")
			->where("type.id = :id")->setParameter("id", $uriVariables["typeId"])
			->getQuery()->getSingleResult();

		assert($data instanceof Tea);
		assert($user instanceof User);

		$teaOrigin = $this->em->find(\App\Entity\Origin::class, $data->origin->id);

		if (null === $teaOrigin) {
			throw new ItemNotFoundException("Tea origin doesn't exist");
		}

		// Check origins compatibility

		$teaOriginPath = $teaOrigin->path->getPath();
		$typeOriginPath = $typeEntity->origin->path->getPath();

		if ($data->origin->path->getNodes()[0] !== $typeEntity->origin->path->getNodes()[0]) {
			throw new \RuntimeException("The origin must be of the same country than the tea type one");
		}

		if ($typeEntity->isProtectedOrigin && false === str_starts_with($teaOriginPath, $typeOriginPath)) {
			throw new \RuntimeException("The origin must be contained by the protected origin of the tea type");
		}


		$entity = new \App\Entity\Tea();
		$entity->family = $typeEntity->family;
		$entity->type = $typeEntity;
		$entity->origin = $this->em->getReference(\App\Entity\Origin::class, $data->origin->id);
		$entity->createdBy = $user;

		if ($this->repository->hasDuplicate($entity)) {
			throw new BadRequestException("This tea already exists");
		}

		$this->em->persist($entity);
		$this->em->flush();

		$resource = new Tea();
		$resource->id = $entity->id;
		$resource->family = $entity->family;
		$resource->type = TeaTypeProvider::fromEntity($entity->type);
		$resource->origin = OriginProvider::fromEntity($teaOrigin);
		$resource->addedAt = $entity->createdAt;

		return $resource;
	}
}
