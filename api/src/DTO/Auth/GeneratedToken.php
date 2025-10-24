<?php

namespace App\DTO\Auth;

use App\Entity\Token;
use App\Service\TokenManager;

final readonly class GeneratedToken
{
	public function __construct(
		/**
		 * Secured string used by the client to reference/use the token.
		 * Only valid for a specific version of the token, if some of
		 * its info change (expiration, owner, etc.), the challenge
		 * will be different.
		 *
		 * @see TokenManager for the generation and internal verification of the challenge
		 */
		public string $challenge,
		public Token $token,
	)
	{
	}
}
