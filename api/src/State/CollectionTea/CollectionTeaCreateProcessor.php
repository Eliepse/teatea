<?php

namespace App\State\CollectionTea;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\CollectionTea;
use App\Entity\User;
use App\State\Hydration\CollectionTeaHydrator;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

readonly class CollectionTeaCreateProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
		private CollectionTeaHydrator $hydrator,
	) {}

	public function process(
		mixed $data,
		Operation $operation,
		array $uriVariables = [],
		array $context = [],
	): CollectionTea {
		$user = $this->security->getUser();

		assert($data instanceof CollectionTea);
		assert($user instanceof User);

		if ($user->username !== $uriVariables["username"]) {
			throw new AccessDeniedHttpException();
		}

		$entity = new \App\Entity\CollectionTea();
		$entity->owner = $user;
		$entity->tea = $this->em->getReference(\App\Entity\Tea::class, $data->tea->id);
		$entity->acquiredAt = $data->acquiredAt;
		$entity->acquiredFrom = $data->acquiredFrom
			? $this->em->getReference(\App\Entity\Business::class, $data->acquiredFrom->id)
			: null;
		$this->em->persist($entity);
		$this->em->flush();

		return $this->hydrator->hydrate($entity);
	}
}
