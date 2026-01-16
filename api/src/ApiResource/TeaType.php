<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\QueryParameter;
use ApiPlatform\OpenApi\Model\Parameter as OpenApiParameter;
use App\Enum\TeaFamily;
use App\State\TeaType\TeaTypeCollectionProvider;
use App\State\TeaType\TeaTypeCreateProcessor;
use App\State\TeaType\TeaTypeProvider;
use App\ValueObject\Stats\TeaTypeStats;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
	normalizationContext: ["groups" => ["type:read", "read:origin", "origin:read", "embedded:origin"]],
	security: "is_granted('ROLE_USER')"
)]
#[Get(provider: TeaTypeProvider::class)]
#[GetCollection(
	paginationEnabled: true,
	paginationItemsPerPage: 15,
	paginationMaximumItemsPerPage: 50,
	paginationClientItemsPerPage: true,
	provider: TeaTypeCollectionProvider::class,
	parameters: [
		"q" => new QueryParameter(property: 'hydra:freetextQuery', description: "Filter by name"),
		"family" => new QueryParameter(schema: ["enum" => TeaFamily::QUERY_PARAMS], property: "family"),
		"originPath" => new QueryParameter(
			schema: ["type" => "string", "example" => "Japan, China.Yunnan, ..."],
			property: "origin",
			description: "Filter by origin path, to get only the given branch",
		),
		"sort" => new QueryParameter(
			schema: ["enum" => ["popularity"]],
			openApi: new OpenApiParameter(name: "enum", in: "query"),
			description: "Sorting method",
		),
	]
)]
#[Post(processor: TeaTypeCreateProcessor::class)]
class TeaType
{
	#[Groups(["read:origin", "with:teatype"])]
	#[ApiProperty(writable: false, identifier: true)]
	public ?string $slug = null;

	#[Groups(["read:origin", "with:teatype"])]
	public TeaFamily $family;

	#[Assert\NotBlank]
	#[Assert\Length(min: 2, max: 16)]
	#[Groups(["embedded:teaType", "with:teatype", "read:origin", "tea:create"])]
	public string $name;

	#[Assert\NotNull]
	#[Groups(["read:origin"])]
	public ?Origin $origin = null;

	#[ApiProperty]
	#[Groups(["read:origin", "tea:create"])]
	public bool $isPDO = false;

	#[Groups(["type:read"])]
	#[ApiProperty(readable: true, readableLink: true, genId: false)]
	public ?TeaTypeStats $stats = null;
}
