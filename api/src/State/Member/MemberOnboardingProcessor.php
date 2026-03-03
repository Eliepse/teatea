<?php

namespace App\State\Member;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\Member;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * @implements ProcessorInterface<Member>
 */
readonly class MemberOnboardingProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
	) {
	}

	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Member
	{
		$user = $this->security->getUser();

		assert($data instanceof Member);
		assert($user->id === $data->id);

		$user->username = $data->username;
		$user->setRoles(["ROLE_USER"]);

		$duplicates = $this->em->createQueryBuilder()
			->select("COUNT(u)")
			->from(User::class, "u")
			->where("LOWER(u.username) = LOWER(UNACCENT(:username))")
			->setParameter("username", $user->username)
			->getQuery()
			->getSingleScalarResult();

		if (false === empty($duplicates)) {
			throw new HttpException(403, "Unavailable username");
		}

		$this->em->persist($user);
		$this->em->flush();

		return MemberProvider::hydrate($user);
	}
}
