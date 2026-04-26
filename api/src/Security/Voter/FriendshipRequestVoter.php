<?php

namespace App\Security\Voter;

use App\Entity\Pivot\Friendship;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Vote;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class FriendshipRequestVoter extends Voter
{
	public const string DECISION = 'FRIENDSHIP_DECISION';

	protected function supports(string $attribute, mixed $subject): bool
	{
		return in_array($attribute, [self::DECISION]) && $subject instanceof Friendship;
	}

	protected function voteOnAttribute(
		string $attribute,
		mixed $subject,
		TokenInterface $token,
		?Vote $vote = null,
	): bool {
		if (!$subject instanceof Friendship) {
			return false;
		}

		// if the user is anonymous, do not grant access
		$user = $token->getUser();
		if (!$user instanceof User) {
			$vote?->addReason('The user must be logged in to access this resource.');
			return false;
		}

		// Only the target user can make a decision
		if ($subject->target->id !== $user->id) {
			return false;
		}

		return false === $subject->decided();
	}
}
