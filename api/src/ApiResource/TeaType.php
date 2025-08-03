<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\QueryParameter;
use App\Enum\TeaFamily;
use App\State\TeaType\TeaTypeCreateProcessor;
use App\State\TeaType\TeaTypeProvider;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

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
	"originPath" => new QueryParameter(
		schema: [
			"type" => "string",
			"example" => "Japan, China.Yunnan, ...",
		],
		property: "origin",
		description: "Filter by origin path, to get only the given branch",

	)
])]
#[Post(security: "is_granted('ROLE_USER')", processor: TeaTypeCreateProcessor::class)]
class TeaType
{
	#[ApiProperty(writable: false, identifier: true)]
	public ?int $id;

	public TeaFamily $family;

	#[Assert\NotBlank]
	#[Groups(["embedded:teaType"])]
	public string $name;

	#[Assert\NotNull]
	public ?Origin $origin = null;

	#[ApiProperty(readable: false)]
	public bool $isProtectedOrigin = false;
}
