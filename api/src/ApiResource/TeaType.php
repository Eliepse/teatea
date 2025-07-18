<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use App\Enum\TeaFamily;
use App\State\TeaTypeProvider;
use Symfony\Component\Serializer\Attribute\Groups;

#[Get(provider: TeaTypeProvider::class)]
#[GetCollection(provider: TeaTypeProvider::class)]
class TeaType
{
	#[ApiProperty(identifier: true)]
	public ?int $id = null;

	public TeaFamily $family;

	#[Groups("tea:create")]
	public string $name;

	public ?Origin $origin = null;
}
