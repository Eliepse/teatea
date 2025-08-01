<?php

namespace App\ValueObject;

readonly class Temperature
{
	public int $degrees;

	public function __construct(int $degrees)
	{
		$this->degrees = $degrees;
	}
}
