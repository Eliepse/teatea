<?php

namespace App\ValueObject;

use ApiPlatform\Metadata\ApiProperty;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Serializer\Attribute\Ignore;

readonly class ActivityGraphDay
{
	public function __construct(
		public int $total,
		public \DateTimeImmutable $date,
	) {
	}

	public function getDate(): string
	{
		return $this->date->format("Y-m-d");
	}
}
