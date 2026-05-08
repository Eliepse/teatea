<?php

namespace App\MessageHandler\Command;

use App\Entity\Business;
use App\Entity\Cultivar;
use App\Entity\Origin;
use App\Entity\Tea;
use App\Entity\TeaType;
use App\Entity\User;
use App\Message\Command\AddTeaCommand;
use App\Message\Query\TeaDuplicatesExistsQuery;
use App\Message\QueryBus;
use App\MessageHandler\Contract\CommandHandlerInterface;
use App\Repository\TeaTypeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityNotFoundException;

final readonly class AddTeaHandler implements CommandHandlerInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private TeaTypeRepository $typeRepo,
		private QueryBus $queryBus,
	) {
	}

	public function __invoke(AddTeaCommand $cmd): Tea
	{
		$type = $this->typeRepo->find($cmd->typeId);

		if (!$type instanceof TeaType) {
			throw new EntityNotFoundException("Unable to find the tea type");
		}

		$entity = new \App\Entity\Tea();
		$entity->family = $type->family;
		$entity->type = $type;
		$entity->origin = $cmd->originPath ? $this->em->getReference(Origin::class, $cmd->originPath) : null;
		$entity->year = $cmd->year;
		$entity->roast = $cmd->roast;
		$entity->createdBy = $cmd->authorId ? $this->em->getReference(User::class, $cmd->authorId) : null;
		$entity->cultivar = $cmd->cultivarId ? $this->em->getReference(Cultivar::class, $cmd->cultivarId) : null;
		$entity->business = $cmd->businessId ? $this->em->getReference(Business::class, $cmd->businessId) : null;

		// Check if the tea has already been created.
		// No need to check if a new type is created as it certainly new
		if ($this->queryBus->ask(
			new TeaDuplicatesExistsQuery(
				$entity->family,
				$entity->type?->id,
				$entity->cultivar?->id,
				$entity->year,
				$entity->roast,
				$entity->origin?->path,
				$entity->business?->id
			),
		)) {
			throw new \RuntimeException("A tea with the same parameters already exists");
		}

		$this->em->persist($entity);
		return $entity;
	}
}
