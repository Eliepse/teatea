<?php

namespace App\ValueObject;

readonly class ActivityGraphDay
{
	public function __construct(
		public int $total,
		public \DateTimeImmutable $date,
		public int $level = 1,
	) {
	}

	public function getDate(): string
	{
		return $this->date->format("Y-m-d");
	}
}
