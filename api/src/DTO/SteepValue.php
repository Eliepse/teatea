<?php

namespace App\DTO;

use App\ValueObject\Duration;
use App\ValueObject\Temperature;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints\GreaterThanOrEqual;

#[Groups(["with:steep"])]
readonly class SteepValue
{
	public Duration $duration;
	public ?Temperature $temperature;

	public function __construct(
		#[GreaterThanOrEqual(1)]
		int $duration,
		#[GreaterThanOrEqual(1)]
		?int $temperature,
	) {
		$this->duration = new Duration($duration);
		$this->temperature = null !== $temperature ? new Temperature($temperature) : null;
	}

	public function getDuration(): int
	{
		return $this->duration->seconds;
	}

	public function getTemperature(): ?int
	{
		return $this->temperature?->degrees;
	}

	public function toArray(): array
	{
		return [
			"dur" => $this->getDuration(),
			"deg" => $this->getTemperature(),
		];
	}

	public static function fromArray(array $data): self
	{
		return new SteepValue($data["dur"], $data["deg"]);
	}
}
