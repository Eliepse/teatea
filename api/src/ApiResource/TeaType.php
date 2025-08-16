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

#[Get(
	normalizationContext: ["groups" => ["read:origin", "embedded:origin"]],
	security: "is_granted('ROLE_USER')", provider: TeaTypeProvider::class,
)]
#[GetCollection(
	paginationEnabled: false,
	normalizationContext: ["groups" => ["read:origin", "embedded:origin"]],
	security: "is_granted('ROLE_USER')",
	provider: TeaTypeProvider::class,
	parameters: [
		"family" => new QueryParameter(
			schema: ["enum" => ["white", "yellow", "green", "wulong", "black", "fermented"]],
			property: "family",
		),
		"originPath" => new QueryParameter(
			schema: ["type" => "string", "example" => "Japan, China.Yunnan, ..."],
			property: "origin",
			description: "Filter by origin path, to get only the given branch",
		),
	]
)]
#[Post(security: "is_granted('ROLE_ADMIN')", processor: TeaTypeCreateProcessor::class)]
class TeaType
{
	#[Groups(["read:origin"])]
	#[ApiProperty(writable: false, identifier: true)]
	public ?int $id = null;

	#[Groups(["read:origin"])]
	public TeaFamily $family;

	#[Assert\NotBlank]
	#[Groups(["embedded:teaType", "read:origin", "tea:create"])]
	public string $name;

	#[Assert\NotNull]
	#[Groups(["read:origin"])]
	public ?Origin $origin = null;

	#[ApiProperty]
	#[Groups(["read:origin", "tea:create"])]
	public bool $isPDO = false;
}
