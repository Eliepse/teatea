<?php

namespace App\Message\Command;

use App\Enum\TeaFamily;

readonly class AddTypeCommand
{
	public function __construct(
		public TeaFamily $family,
		public string $name,
		public int $authorId,
	)
	{
	}
}
