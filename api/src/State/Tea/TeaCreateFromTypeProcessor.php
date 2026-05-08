<?php

namespace App\State\Tea;

use ApiPlatform\Metadata\Exception\ItemNotFoundException;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\Tea;
use App\Entity\Cultivar;
use App\Entity\User;
use App\Repository\OriginRepository;
use App\Repository\TeaRepository;
use App\Repository\TeaTypeRepository;
use App\State\Origin\OriginProvider;
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
		private OriginRepository $originRepo,
		private TeaTypeRepository $typeRepo,
		private Security $security,
	) {
	}

	/**
	 * @param Tea $data
	 * @param Operation $operation
	 * @param array $uriVariables
	 * @param array $context
	 *
	 * @return mixed
	 * @throws ORMException
	 */
	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Tea
	{
		$user = $this->security->getUser();
		assert($user instanceof User);
		assert($data instanceof Tea);

		/** @var \App\Entity\TeaType $typeEntity */
		$typeEntity = $this->typeRepo->findOneBy(["slug" => $uriVariables["slug"]]);
		if (null === $typeEntity) {
			throw new ItemNotFoundException("Tea type doesn't exist");
		}

		$teaOrigin = null !== $data->origin ? $this->originRepo->byPath($data->origin->path) : null;
		if (null !== $data->origin && null === $teaOrigin) {
			throw new ItemNotFoundException("Tea origin doesn't exist");
		}

		$entity = new \App\Entity\Tea();
		$entity->family = $typeEntity->family;
		$entity->type = $typeEntity;
		$entity->origin = $teaOrigin;
		$entity->year = $data->year;
		$entity->roast = $data->roast;
		$entity->createdBy = $user;
		$entity->cultivar = $data->cultivar ? $this->em->getReference(Cultivar::class, $data->cultivar->id) : null;

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
