<?php

namespace App\ValueObject;

readonly class Duration
{
	public int $seconds;

	public function __construct(int $seconds)
	{
		if (0 > $seconds) {
			throw new \RuntimeException("A Duration cannot be negative");
		}

		$this->seconds = $seconds;
	}
}
