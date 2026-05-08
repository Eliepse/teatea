<?php

namespace App\State\Tea;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\Tea;
use App\Entity\User;
use App\Message\Command\AddTypeCommand;
use App\Message\CommandBus;
use App\Message\Query\FindTypeFamilyQuery;
use App\Message\QueryBus;
use App\Repository\OriginRepository;
use App\Repository\TeaRepository;
use App\Repository\TeaTypeRepository;
use App\State\Origin\OriginProvider;
use App\State\TeaType\TeaTypeProvider;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Exception\ORMException;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;

readonly class TeaCreateProcess implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private TeaRepository $teaRepository,
		private TeaTypeRepository $typeRepository,
		private OriginRepository $originRepo,
		private Security $security,
		private CommandBus $commandBus,
		private QueryBus $queryBus,
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

		$origin = null !== $data->origin ? $this->originRepo->byPath($data->origin->path) : null;
		if (null !== $data->origin && null === $origin) {
			throw new BadRequestException("The given origin doesn't exist");
		}

		$teaEntity = new \App\Entity\Tea();
		$teaEntity->family = $data->family;
		$teaEntity->origin = $origin;
		$teaEntity->year = $data->year;
		$teaEntity->roast = $data->roast;
		$teaEntity->createdBy = $user;

		// Create the new type if needed
		if (null !== $data->type) {
			$typeCmd = new AddTypeCommand($data->family, $data->type->name, $user->id);
			$teaEntity->type = $this->commandBus->process($typeCmd);
		} else {
			$teaEntity->type = $this->queryBus->ask(new FindTypeFamilyQuery($data->family));
		}

		// Check if the tea has already been created.
		// No need to check if a new type is created as it certainly new
		if (null === $data->type && $this->teaRepository->hasDuplicate($teaEntity)) {
			throw new BadRequestException("A tea with the same parameters already exists", ["data" => $data]);
		}

		// Create the new tea
		$this->em->persist($teaEntity);
		$this->em->flush();

		// Hydrate new resource

		$resource = new Tea();
		$resource->id = $teaEntity->id;
		$resource->family = $teaEntity->family;
		$resource->type = TeaTypeProvider::fromEntity($teaEntity->type);
		$resource->origin = OriginProvider::fromEntity($teaEntity->origin);
		$resource->addedAt = $teaEntity->createdAt;

		return $resource;
	}
}
