<?php

namespace App\State\Member;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\Member;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * @implements ProcessorInterface<Member>
 */
readonly class MemberCreateProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
	)
	{
	}

	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Member
	{
		$user = $this->security->getUser();

		assert($data instanceof Member);
		assert($user instanceof User && $user->hasRole("ROLE_ADMIN"));

		$entity = new \App\Entity\User();
		$entity->email = $data->email;
		$entity->setRoles([]);

		$this->em->persist($entity);
		$this->em->flush();


		return MemberProvider::hydrate($user);
	}
}
