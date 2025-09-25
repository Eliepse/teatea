<?php

namespace App\State\Cultivar;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\Cultivar;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

readonly class CultivarCreateProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
	) {
	}

	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Cultivar
	{
		$user = $this->security->getUser();

		assert($data instanceof Cultivar);
		assert($user instanceof User);

		$refinedName = preg_replace("/\s+/", " ", $data->name);

		$exitingIds = $this->em
			->createQuery(
				"SELECT c.id FROM App\Entity\Cultivar c WHERE lower(unaccent(c.name)) = lower(unaccent(:name))",
			)
			->setParameter("name", $refinedName)
			->getScalarResult();

		if (false === empty($exitingIds)) {
			throw new BadRequestHttpException("A cultivar with the same name already exists");
		}

		$entity = new \App\Entity\Cultivar();
		$entity->name = trim($data->name);
		$entity->author = $user;
		$this->em->persist($entity);
		$this->em->flush();

		return CultivarProvider::fromEntity($entity);
	}
}
