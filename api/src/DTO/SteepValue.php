<?php

namespace App\DTO;

use App\ValueObject\Duration;
use App\ValueObject\Temperature;

readonly class SteepValue
{
	public function __construct(
		public string $key,
		public Duration $duration,
		public ?Temperature $temperature,
	) {
	}
}
