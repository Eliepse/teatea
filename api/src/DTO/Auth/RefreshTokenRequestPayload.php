<?php

namespace App\DTO\Auth;

use Symfony\Component\Validator\Constraints as Assert;

readonly class RefreshTokenRequestPayload
{
	public function __construct(
		#[Assert\NotBlank]
		public string $refresh_token,
	) {
	}
}
