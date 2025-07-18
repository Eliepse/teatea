<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\QueryParameter;
use App\Enum\TeaFamily;
use App\State\TeaTypeProvider;
use Symfony\Component\Serializer\Attribute\Groups;

#[Get(provider: TeaTypeProvider::class)]
#[GetCollection(paginationEnabled: false, provider: TeaTypeProvider::class, parameters: [
	"family" => new QueryParameter(
		schema: ["enum" => ["white", "yellow", "green", "wulong", "black", "fermented"]],
		property: "family",
	),
	"origin" => new QueryParameter(
		schema: ['minimum' => 1, 'type' => "integer"],
		property: "origin",
	),
])]
class TeaType
{
	#[ApiProperty(identifier: true)]
	public ?int $id = null;

	public TeaFamily $family;

	#[Groups("tea:create")]
	public string $name;

	public ?Origin $origin = null;
}
