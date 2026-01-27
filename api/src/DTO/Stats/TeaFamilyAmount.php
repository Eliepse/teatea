<?php

namespace App\DTO\Stats;

use ApiPlatform\Metadata\ApiProperty;
use App\Enum\TeaFamily;
use Symfony\Component\Serializer\Attribute\Groups;

/**
 * Amount of tea consumed by a member
 */
#[Groups(["member:stats"])]
readonly class TeaFamilyAmount
{
	public function __construct(
		#[ApiProperty(identifier: true)]
		public TeaFamily $family,
		public int $sessions,
	) {}
}
