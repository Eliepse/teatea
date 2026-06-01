<?php

namespace App\Message\Command;

readonly class AddBusinessCommand
{
	public function __construct(
		public string $name,
		public int $authorId,
	) {
	}
}
