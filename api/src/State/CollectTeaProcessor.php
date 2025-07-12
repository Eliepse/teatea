<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\Tea;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

readonly class CollectTeaProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
	)
	{
	}

	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Tea
	{
		assert($data instanceof Tea);

		$user = $this->security->getUser();

		assert($user instanceof User);

		$user->addTea($this->em->find(\App\Entity\Tea::class, $uriVariables["id"]));
		$this->em->persist($user);
		$this->em->flush();

		return $data;
	}
}
