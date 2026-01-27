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
	) {}

	public function toArray(): array
	{
		return [
			"key" => $this->key,
			"dur" => $this->duration->seconds,
			"deg" => $this->temperature?->degrees ?: null,
		];
	}

	public static function fromArray(array $data): self
	{
		return new SteepValue($data["key"], new Duration($data["dur"]), $data["deg"] ? new Temperature($data["deg"]) : null);
	}
}
