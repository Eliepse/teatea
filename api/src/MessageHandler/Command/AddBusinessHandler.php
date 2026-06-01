<?php

namespace App\MessageHandler\Command;

use App\Entity\Business;
use App\Entity\User;
use App\Exception\DuplicatedEntityException;
use App\Message\Command\AddBusinessCommand;
use App\MessageHandler\Contract\CommandHandlerInterface;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\EntityManagerInterface;

use function Symfony\Component\String\u;

final readonly class AddBusinessHandler implements CommandHandlerInterface
{
	public function __construct(
		private EntityManagerInterface $em,
	) {
	}

	public function __invoke(AddBusinessCommand $cmd): Business
	{
		$name = u($cmd->name)->trim();

		$similarCount = $this->em->createQuery(
			<<<DQL
			SELECT count(business)
			FROM App\Entity\Business business
			WHERE LOWER(UNACCENT(business.name)) = :name
			DQL,
		)
			->setParameter("name", $name->lower()->ascii())
			->getOneOrNullResult(AbstractQuery::HYDRATE_SINGLE_SCALAR) ?? 0;

		if (0 !== $similarCount) {
			throw new DuplicatedEntityException("Looks like a similar business already exists");
		}

		$entity = new \App\Entity\Business();
		$entity->name = $name->toString();
		$entity->author = $this->em->getReference(User::class, $cmd->authorId);

		$this->em->persist($entity);
		return $entity;
	}
}
