<?php

namespace App\MessageHandler\Command;

use App\Doctrine\DBAL\Types\ValueObject\LTreePath;
use App\Entity\Origin;
use App\Entity\User;
use App\Exception\DuplicatedEntityException;
use App\Message\Command\AddOriginCommand;
use App\MessageHandler\Contract\CommandHandlerInterface;
use App\Repository\OriginRepository;
use Doctrine\ORM\EntityManagerInterface;

use function Symfony\Component\String\u;

final readonly class AddOriginHandler implements CommandHandlerInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private OriginRepository $originRepo,
	) {
	}

	public function __invoke(AddOriginCommand $cmd): Origin
	{
		$parentPath = new LTreePath([]);

		if (false === empty($cmd->parentId)) {
			$parent = $this->originRepo->findOneBy(["path" => LTreePath::fromString($cmd->parentId)]);

			if (null === $parent) {
				throw new \RuntimeException("Parent origin doesn't exists or is invalid");
			}

			$parentPath = $parent->path;
		}

		if (3 <= $parentPath->level()) {
			throw new \RuntimeException("Cannot create an origin of a locality or lower level");
		}

		$entity = new \App\Entity\Origin();
		$entity->name = $cmd->name;
		$entity->author = $this->em->getReference(User::class, $cmd->authorId);

		$pathNode = u($cmd->name)->ascii()->pascal();
		$entity->path = new LTreePath([...$parentPath->getNodes(), $pathNode]);

		// Check for duplicates
		$duplicates = $this->originRepo->findBy(["path" => $entity->path]);

		if (false === empty($duplicates)) {
			throw new DuplicatedEntityException("Looks like a similar origin already exists");
		}

		$this->em->persist($entity);
		return $entity;
	}
}
