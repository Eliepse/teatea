<?php

namespace App\ValueObject\Stats;

use Symfony\Component\Serializer\Attribute\Groups;

#[Groups(["type:read"])]
readonly class TeaTypeStats
{
	public function __construct(
		public ?int $rank = null,
		public ?int $teasCount = null,
		public ?int $sessionsCount = null,
	) {}
}
