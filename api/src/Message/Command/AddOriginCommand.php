<?php

namespace App\Message\Command;

readonly class AddOriginCommand
{
	public function __construct(
		public string $name,
		public ?string $parentId,
		public int $authorId,
	) {
	}
}
