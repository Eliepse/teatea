<?php

namespace App\DTO\Auth;

use App\Entity\Token;

final readonly class GeneratedToken
{
	public function __construct(
		public string $challenge,
		public Token $token,
	)
	{
	}
}
