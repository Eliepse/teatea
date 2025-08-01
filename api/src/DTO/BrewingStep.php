<?php

namespace App\DTO;

use App\ValueObject\Duration;
use App\ValueObject\Temperature;

readonly class BrewingStep
{
	public function __construct(
		public Temperature $temperature,
		public Duration $duration,
	) {
	}

	public static function fromResource(\App\ApiResource\BrewingStep $resource): BrewingStep
	{
		return new BrewingStep(
			new Temperature($resource->temperature),
			new Duration($resource->duration),
		);
	}
}
