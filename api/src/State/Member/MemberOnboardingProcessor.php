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
readonly class MemberOnboardingProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
	) {}

	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Member
	{
		$user = $this->security->getUser();

		assert($data instanceof Member);
		assert($user instanceof User && $user->hasRole("ROLE_ONBOARDING"));
		assert($user->id === $data->id);

		$user->username = $data->username;
		$user->setRoles(["ROLE_USER"]);

		$this->em->persist($user);
		$this->em->flush();

		return MemberProvider::hydrate($user);
	}
}
