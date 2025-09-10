<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\QueryParameter;
use ApiPlatform\OpenApi\Model\Parameter as OpenApiParameter;
use App\DTO\OriginPath;
use App\Enum\TeaFamily;
use App\State\Tea\TeaCollectionProvider;
use App\State\Tea\TeaCreateFromTypeProcessor;
use App\State\Tea\TeaCreateProcess;
use App\State\Tea\TeaProvider;
use Symfony\Component\Serializer\Attribute\Groups;


#[ApiResource(security: "is_granted('ROLE_USER')")]
#[Get(
	normalizationContext: ["groups" => ["tea:read", "embedded:teaType", "embedded:originPath"]],
	provider: TeaProvider::class),
]
#[GetCollection(
	paginationEnabled: false,
	normalizationContext: ["groups" => ["tea:read", "embedded:teaType", "embedded:originPath"]],
	provider: TeaCollectionProvider::class,
	parameters: [
//		"origin" => new QueryParameter(description: "Filter by origin"),
//		"family" => new QueryParameter(description: "Filter by family"),
//		"type" => new QueryParameter(description: "Filter by type"),
		"q" => new QueryParameter(property: 'hydra:freetextQuery', description: "Filter by name"),
		"sort" => new QueryParameter(
			schema: ["enum" => ["popularity"],],
			openApi: new OpenApiParameter(name: "enum", in: "query"),
			description: "Sorting method",
		),
	],
)]
#[Post(
	normalizationContext: ["groups" => ["tea:read"]],
	denormalizationContext: ["groups" => ["tea:create"]],
	processor: TeaCreateProcess::class,
)]
#[Post(
	uriTemplate: "/tea_types/{typeId}/teas",
	uriVariables: ["typeId" => new Link(toProperty: "type", fromClass: TeaType::class)],
	normalizationContext: ["groups" => ["tea:read"]],
	denormalizationContext: ["groups" => ["tea:createFromType"]],
	processor: TeaCreateFromTypeProcessor::class,
)]
class Tea
{
	#[ApiProperty(identifier: true)]
	#[Groups(["tea:read", "embedded:tea"])]
	public ?int $id;

	#[Groups(["tea:create", "tea:read", "embedded:tea"])]
	public TeaFamily $family;

	#[Groups(["tea:create", "tea:read", "embedded:tea"])]
	public ?TeaType $type = null;

	#[ApiProperty(genId: false)]
	#[Groups(["embedded:tea", "embedded:originPath"])]
	public ?OriginPath $originPath = null;

	#[Groups(["tea:create", "tea:read", "tea:createFromType"])]
	public ?Origin $origin = null;

	#[Groups(["tea:read"])]
	public \DateTimeImmutable $addedAt;

	public function __construct()
	{
		$this->addedAt = new \DateTimeImmutable();
	}

	#[Groups(["tea:read", "embedded:tea"])]
	public function getDisplayName(): string
	{
		if (null !== $this->type) {
			return $this->type->name;
		}

		return "{$this->family->name} tea";
	}
}
