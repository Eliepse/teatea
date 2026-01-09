<?php

namespace App\State\Origin;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Origin;
use App\Doctrine\DBAL\Types\ValueObject\LTreePath;
use App\Entity\User;
use App\Repository\OriginRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

use function Symfony\Component\String\u;

/**
 * @implements ProviderInterface<Origin|null>
 */
readonly class OriginProcessor implements ProcessorInterface
{
	public function __construct(
		private Security $security,
		private EntityManagerInterface $em,
		private OriginRepository $originRepo,
	) {
	}

	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Origin
	{
		assert($data instanceof Origin);

		$user = $this->security->getUser();
		assert($user instanceof User);

		$parentPath = new LTreePath([]);

		if (false === empty($data->parentPath)) {
			$parent = $this->originRepo->findOneBy(["path" => LTreePath::fromString($data->parentPath)]);

			if (null === $parent) {
				throw new BadRequestHttpException("Parent origin doesn't exists or is invalid");
			}

			$parentPath = $parent->path;
		}

		if (3 <= $parentPath->level()) {
			throw new BadRequestHttpException("Cannot create an origin of a locality or lower level");
		}


		$entity = new \App\Entity\Origin();
		$entity->name = $data->name;
		$entity->author = $user;

		$pathNode = u($data->name)->pascal();
		$entity->path = new LTreePath([...$parentPath->getNodes(), $pathNode]);

		// Check for duplicates
		$duplicates = $this->originRepo->findBy(["path" => $entity->path]);

		if (false === empty($duplicates)) {
			throw new BadRequestHttpException("Looks like a similar origin already exists");
		}

		$this->em->persist($entity);
		$this->em->flush();

		$resource = OriginProvider::fromEntity($entity);
		$resource->isLeaf = true;
		return $resource;
	}
}
