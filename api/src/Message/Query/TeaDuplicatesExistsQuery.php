<?php

namespace App\Message\Query;

use App\Enum\RoastLevel;
use App\Enum\TeaFamily;

final readonly class TeaDuplicatesExistsQuery
{
	public function __construct(
		public TeaFamily $family,
		public ?int $typeId,
		public ?int $cultivarId,
		public ?int $year,
		public ?RoastLevel $roast,
		public ?string $originPath,
	) {
	}
}
