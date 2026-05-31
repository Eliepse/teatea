<?php

namespace App\MessageHandler\Command;

use App\Entity\Cultivar;
use App\Entity\User;
use App\Exception\DuplicatedEntityException;
use App\Message\Command\AddCultivarCommand;
use App\MessageHandler\Contract\CommandHandlerInterface;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\EntityManagerInterface;

use function Symfony\Component\String\u;

final readonly class AddCultivarHandler implements CommandHandlerInterface
{
	public function __construct(
		private EntityManagerInterface $em,
	) {
	}

	public function __invoke(AddCultivarCommand $cmd): Cultivar
	{
		$name = u($cmd->name)->trim();

		$similarCount = $this->em->createQuery(
			<<<DQL
			SELECT count(cultivar)
			FROM App\Entity\Cultivar cultivar
			WHERE LOWER(UNACCENT(cultivar.name)) = :name
			DQL,
		)
			->setParameter("name", $name->lower()->ascii())
			->getOneOrNullResult(AbstractQuery::HYDRATE_SINGLE_SCALAR) ?? 0;

		if (0 !== $similarCount) {
			throw new DuplicatedEntityException("Looks like a similar cultivar already exists");
		}

		$entity = new \App\Entity\Cultivar();
		$entity->name = $name->toString();
		$entity->author = $this->em->getReference(User::class, $cmd->authorId);

		$this->em->persist($entity);
		return $entity;
	}
}
