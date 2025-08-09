<?php

namespace App\State\Tea;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\Tea;
use App\ApiResource\TeaType;
use App\DTO\OriginPath;
use App\Entity\Origin;
use App\Entity\User;
use App\Repository\TeaRepository;
use App\State\OriginProvider;
use App\State\TeaType\TeaTypeProvider;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Exception\ORMException;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

readonly class TeaCreateProcess implements ProcessorInterface
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

		assert($data instanceof Tea);
		assert($user instanceof User);

		// Type shouldn't exists as it will be created
		assert(null === $data->type->id);

		if (null === $origin = $this->em->find(Origin::class, $data->origin->id)) {
			throw new BadRequestException("The given origin doesn't exist");
		}

		// Create the new type

		// TODO: check if the type doesn't already exists
		$typeEntity = new \App\Entity\TeaType();
		$typeEntity->family = $data->family;
		$typeEntity->name = trim($data->type->name);
		$typeEntity->origin = $origin;
		$typeEntity->isProtectedOrigin = $data->type->isProtectedOrigin;
		$typeEntity->createdBy = $user;
		$this->em->persist($typeEntity);

		// Create the new tea

		$teaEntity = new \App\Entity\Tea(createdAt: $data->addedAt);
		$teaEntity->family = $data->family;
		$teaEntity->type = $typeEntity;
		$teaEntity->origin = $origin;
		$teaEntity->createdBy = $user;
		$this->em->persist($teaEntity);

		// No need to check for duplicates as no tea has
		// been created with this type yet!

		$this->em->flush();

		// Hydrate new resource

		$resource = new Tea();
		$resource->id = $teaEntity->id;
		$resource->family = $teaEntity->family;
		$resource->type = TeaTypeProvider::fromEntity($typeEntity);
		$resource->origin = OriginProvider::fromEntity($teaEntity->origin);
		$resource->addedAt = $teaEntity->createdAt;

		return $resource;
	}
}
