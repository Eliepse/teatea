<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use App\Entity\Origin;
use App\Enum\TeaFamily;
use App\State\TeaTypeProvider;

#[Get(provider: TeaTypeProvider::class)]
#[GetCollection(provider: TeaTypeProvider::class)]
class TeaType
{
	#[ApiProperty(identifier: true)]
	public ?int $id = null;

	public TeaFamily $family;

	public string $name;

	public ?Origin $origin = null;
}
