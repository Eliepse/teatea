<?php

namespace App\Message\Command;

readonly class AddCultivarCommand
{
	public function __construct(
		public string $name,
		public int $authorId,
	) {
	}
}
