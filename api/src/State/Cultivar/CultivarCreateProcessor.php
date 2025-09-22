<?php

namespace App\State\Cultivar;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\Cultivar;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

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

		$entity = new \App\Entity\Cultivar();
		$entity->name = trim($data->name);
		$entity->author = $user;
		$this->em->persist($entity);
		$this->em->flush();

		return CultivarProvider::fromEntity($entity);
	}
}
