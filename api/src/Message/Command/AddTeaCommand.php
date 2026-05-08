<?php

namespace App\Message\Command;

use App\Enum\RoastLevel;

readonly class AddTeaCommand
{
	public function __construct(
		public int $typeId,
		public ?string $originPath = null,
		public ?int $year = null,
		public ?RoastLevel $roast = null,
		public ?int $cultivarId = null,
		public ?int $authorId = null,
		public ?int $businessId = null,
	)
	{
	}
}
