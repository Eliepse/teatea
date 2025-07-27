<?php

namespace App\ValueObject;

readonly class Weight
{
	public float $value;

	public function __construct(float $kg)
	{
		$this->value = $kg;
	}

	public function toGrams(): float
	{
		return $this->value * 1_000;
	}

	public static function fromGrams(float $g): Weight
	{
		return new Weight($g / 1_000.0);
	}
}
