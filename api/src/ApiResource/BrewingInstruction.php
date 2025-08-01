<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use App\ValueObject\Temperature;

class BrewingInstruction
{
	#[ApiProperty(identifier: true)]
	public ?int $id = null;

	public Temperature $temperature;
}
