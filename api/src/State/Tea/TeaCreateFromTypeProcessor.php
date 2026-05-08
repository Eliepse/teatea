<?php

namespace App\State\Tea;

use ApiPlatform\Metadata\Exception\ItemNotFoundException;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\Tea;
use App\Entity\User;
use App\Message\Command\AddTeaCommand;
use App\Message\CommandBus;
use App\Message\QueryBus;
use App\Repository\OriginRepository;
use App\Repository\TeaTypeRepository;
use App\State\Business\BusinessProvider;
use App\State\Origin\OriginProvider;
use App\State\TeaType\TeaTypeProvider;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Exception\ORMException;
use Symfony\Bundle\SecurityBundle\Security;

readonly class TeaCreateFromTypeProcessor implements ProcessorInterface
{
	public function __construct(
		private TeaTypeRepository $typeRepo,
		private Security $security,
		private CommandBus $commandBus,
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

		/** @var \App\Entity\Tea $entity */
		$entity = $this->commandBus->process(
			new AddTeaCommand(
				$typeEntity->id,
				$data->origin?->path,
				$data->year,
				$data->roast,
				$data->cultivar?->id,
				$user->id,
				$data->business?->id,
			),
		);

		$resource = new Tea();
		$resource->id = $entity->id;
		$resource->family = $entity->family;
		$resource->type = TeaTypeProvider::fromEntity($entity->type);
		$resource->origin = OriginProvider::fromEntity($entity->origin);
		$resource->roast = $entity->roast;
		$resource->year = $entity->year;
		$resource->addedAt = $entity->createdAt;
		$resource->business = BusinessProvider::fromEntity($entity->business);

		return $resource;
	}
}
