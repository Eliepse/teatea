<?php

namespace App\State\Tea;

use ApiPlatform\Metadata\Exception\ItemNotFoundException;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\Tea;
use App\Entity\User;
use App\Repository\OriginRepository;
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
		private OriginRepository $originRepo,
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

		if (null === $teaOrigin = $this->originRepo->byPath($data->origin->path)) {
			throw new ItemNotFoundException("Tea origin doesn't exist");
		}

		// Check origins compatibility

		$countryKey = $teaOrigin->path->getNodes()[0];
		if (false === $typeEntity->origin->path->isDescendant($countryKey)) {
			throw new \RuntimeException("The origin must be of the same country than the tea type one");
		}

		if ($typeEntity->isProtectedOrigin && false === $teaOrigin->path->isDescendant($typeEntity->origin->path)) {
			throw new \RuntimeException("The origin must be contained by the protected origin of the tea type");
		}

		$entity = new \App\Entity\Tea();
		$entity->family = $typeEntity->family;
		$entity->type = $typeEntity;
		$entity->origin = $teaOrigin;
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
