<?php

namespace App\ValueObject;

readonly class Volume
{
	public float $value;

	public function __construct(float $liters)
	{
		$this->value = $liters;
	}

	public function toMl(): float
	{
		return $this->value * 1_000;
	}

	public static function fromMl(float $ml): Volume
	{
		return new Volume($ml / 1_000.0);
	}
}
