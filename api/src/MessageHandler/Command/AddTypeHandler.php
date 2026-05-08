<?php

namespace App\MessageHandler\Command;

use App\Entity\TeaType;
use App\Entity\User;
use App\Message\Command\AddTypeCommand;
use App\MessageHandler\Contract\CommandHandlerInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\String\Slugger\AsciiSlugger;

final readonly class AddTypeHandler implements CommandHandlerInterface
{
	public function __construct(
		private EntityManagerInterface $em,
	) {
	}

	public function __invoke(AddTypeCommand $cmd): TeaType
	{
		$entity = new \App\Entity\TeaType();
		$entity->family = $cmd->family;
		$entity->name = trim($cmd->name);
		$entity->slug = new AsciiSlugger()->slug($entity->name)->lower()->toString();
		$entity->createdBy = $cmd->authorId ? $this->em->getReference(User::class, $cmd->authorId) : null;

		$this->em->persist($entity);
		return $entity;
	}
}
