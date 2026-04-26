<?php

namespace App\Security\Voter;

use App\ApiResource\Member;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Vote;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class FriendshipVoter extends Voter
{
	public const string READ = 'FRIEND_READ';

	public function __construct(
		private readonly EntityManagerInterface $em,
	) {
	}

	protected function supports(string $attribute, mixed $subject): bool
	{
		return in_array($attribute, [self::READ]) && $subject instanceof Member;
	}

	protected function voteOnAttribute(
		string $attribute,
		mixed $subject,
		TokenInterface $token,
		?Vote $vote = null,
	): bool {
		$user = $token->getUser();

		// if the user is anonymous, do not grant access
		if (!$user instanceof User) {
			$vote?->addReason('The user must be logged in to access this resource.');
			return false;
		}

		if (!$subject instanceof Member) {
			return false;
		}

		if ($subject->username === $user->username) {
			return true;
		}

		/** @var User|null $memberEntity */
		$memberEntity = $this->em->find(User::class, $subject->id);
		return true === $memberEntity?->findFriendship($user)?->accepted();
	}
}
