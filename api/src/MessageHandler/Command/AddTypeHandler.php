<?php

namespace App\MessageHandler\Command;

use App\Entity\TeaType;
use App\Entity\User;
use App\Exception\DuplicatedEntityException;
use App\Message\Command\AddTypeCommand;
use App\MessageHandler\Contract\CommandHandlerInterface;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\String\Slugger\AsciiSlugger;

use function Symfony\Component\String\u;

final readonly class AddTypeHandler implements CommandHandlerInterface
{
	public function __construct(
		private EntityManagerInterface $em,
	) {
	}

	public function __invoke(AddTypeCommand $cmd): TeaType
	{
		$name = u($cmd->name)->trim();
		$slug = new AsciiSlugger()->slug($name)->lower();

		$similarCount = $this->em->createQuery(
			<<<DQL
			SELECT count(type)
			FROM App\Entity\TeaType type
			WHERE type.slug = :slug
			DQL,
		)
			->setParameter("slug", $slug->toString())
			->getOneOrNullResult(AbstractQuery::HYDRATE_SINGLE_SCALAR) ?? 0;

		if (0 !== $similarCount) {
			throw new DuplicatedEntityException("Looks like a similar type already exists");
		}

		$entity = new \App\Entity\TeaType();
		$entity->family = $cmd->family;
		$entity->name = $name->toString();
		$entity->slug = $slug->toString();
		$entity->createdBy = $cmd->authorId ? $this->em->getReference(User::class, $cmd->authorId) : null;

		$this->em->persist($entity);
		return $entity;
	}
}
