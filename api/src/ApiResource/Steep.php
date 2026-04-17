<?php

namespace App\ApiResource;

use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints\GreaterThanOrEqual;

#[Groups(["with:steep"])]
class Steep
{
	#[GreaterThanOrEqual(1)]
	public int $duration;

	#[GreaterThanOrEqual(1)]
	public ?int $temperature = null;
}
