<?php

namespace App\State\Tea;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\Tea;
use App\Entity\User;
use App\Message\Command\AddTeaCommand;
use App\Message\Command\AddTypeCommand;
use App\Message\CommandBus;
use App\Message\Query\FindTypeFamilyQuery;
use App\Message\QueryBus;
use App\Repository\OriginRepository;
use App\Repository\TeaRepository;
use App\Repository\TeaTypeRepository;
use App\State\Business\BusinessProvider;
use App\State\Origin\OriginProvider;
use App\State\TeaType\TeaTypeProvider;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Exception\ORMException;
use Symfony\Bundle\SecurityBundle\Security;

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

		// Create the new type if needed
		if (null !== $data->type) {
			$type = $this->commandBus->process(
				new AddTypeCommand(
					$data->family,
					$data->type->name,
					$user->id,
				),
			);
		} else {
			$type = $this->queryBus->ask(new FindTypeFamilyQuery($data->family));
		}

		/** @var \App\Entity\Tea $entity */
		$entity = $this->commandBus->process(
			new AddTeaCommand(
				$type->id,
				$data->origin?->path,
				$data->year,
				$data->roast,
				$data->cultivar?->id,
				$user->id,
				$data->business?->id,
			),
		);

		// Hydrate new resource

		$resource = new Tea();
		$resource->id = $entity->id;
		$resource->family = $entity->family;
		$resource->type = TeaTypeProvider::fromEntity($entity->type);
		$resource->origin = OriginProvider::fromEntity($entity->origin);
		$resource->addedAt = $entity->createdAt;
		$resource->roast = $entity->roast;
		$resource->year = $entity->year;
		$resource->business = BusinessProvider::fromEntity($entity->business);

		return $resource;
	}
}
