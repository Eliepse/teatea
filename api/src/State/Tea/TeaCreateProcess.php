<?php

namespace App\State\Tea;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\Tea;
use App\Entity\Business;
use App\Entity\Cultivar;
use App\Entity\Origin;
use App\Entity\User;
use App\Message\Command\AddBusinessCommand;
use App\Message\Command\AddCultivarCommand;
use App\Message\Command\AddOriginCommand;
use App\Message\Command\AddTeaCommand;
use App\Message\Command\AddTypeCommand;
use App\Message\CommandBus;
use App\Repository\TeaTypeRepository;
use App\State\Business\BusinessProvider;
use App\State\Origin\OriginProvider;
use App\State\TeaType\TeaTypeProvider;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Exception\ORMException;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

readonly class TeaCreateProcess implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private TeaTypeRepository $typeRepo,
		private Security $security,
		private CommandBus $commandBus,
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

		$type = null;
		$origin = null;
		$business = null;
		$cultivar = null;

		// Create the new type if needed
		if (null !== $data->type && null === $data->type->slug) {
			$type = $this->commandBus->process(new AddTypeCommand($data->type->family, $data->type->name, $user->id));
		} elseif (null !== $data->origin?->path) {
			$type = $this->typeRepo->findOneBy(["slug" => $data->type->slug]);
		}

		if (!$type) {
			throw new NotFoundHttpException("Couldn't find the type: {$data->type->slug}");
		}

		// Create the new type if needed
		if (null !== $data->origin && null === $data->origin->path) {
			$origin = $this->commandBus->process(
				new AddOriginCommand($data->origin->name, $data->origin->parentPath, $user->id),
			);
		} elseif (null !== $data->origin?->path) {
			$origin = $this->em->getReference(Origin::class, $data->origin->path);
		}

		// Create the new type if needed
		if (null !== $data->business && null === $data->business->id) {
			$business = $this->commandBus->process(
				new AddBusinessCommand($data->business->name, $user->id),
			);
		} elseif (null !== $data->business?->id) {
			$business = $this->em->getReference(Business::class, $data->business->id);
		}

		// Create the new cultivar if needed
		if (null !== $data->cultivar && null === $data->cultivar->id) {
			$cultivar = $this->commandBus->process(
				new AddCultivarCommand($data->cultivar->name, $user->id),
			);
		} elseif (null !== $data->cultivar?->id) {
			$cultivar = $this->em->getReference(Cultivar::class, $data->cultivar->id);
		}

		/** @var \App\Entity\Tea $entity */
		$entity = $this->commandBus->process(
			new AddTeaCommand(
				$type->id,
				$origin?->path,
				$data->year,
				$data->roast,
				$cultivar?->id,
				$user->id,
				$business?->id,
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
