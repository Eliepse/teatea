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
use App\Enum\RoastLevel;
use App\Enum\TeaFamily;
use App\State\Tea\ListedTeaCollectionProvider;
use App\State\Tea\TeaCollectionProvider;
use App\State\Tea\TeaCreateFromTypeProcessor;
use App\State\Tea\TeaCreateProcess;
use App\State\Tea\TeaProvider;
use Symfony\Component\Routing\Requirement\Requirement;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

use function Symfony\Component\TypeInfo\TypeFactoryTrait;

#[ApiResource(security: "is_granted('ROLE_USER')")]
#[Get(normalizationContext: [
	"groups" => [
		"tea:read",
		"embedded:teaType",
		"with:origin",
		"embedded:cultivar",
	]
], provider: TeaProvider::class)]
#[GetCollection(
	paginationEnabled: true,
	paginationItemsPerPage: 15,
	paginationMaximumItemsPerPage: 50,
	paginationClientItemsPerPage: true,
	normalizationContext: ["groups" => ["tea:read", "embedded:teaType", "with:origin", "embedded:cultivar"]],
	provider: TeaCollectionProvider::class,
	parameters: [
		"family" => new QueryParameter(
			schema: ["enum" => TeaFamily::QUERY_PARAMS],
			description: "Filter by family",
			castToNativeType: true,
		),
		"type" => new QueryParameter(
			schema: ["type" => Requirement::ASCII_SLUG, "example" => "kamairicha, sencha-mature, ..."],
			property: "type",
			description: "Filter by tea type. Ignore `family`, `q` and `origin` filters when applied.",
		),
		"cultivar" => new QueryParameter(
			schema: ["type" => Requirement::POSITIVE_INT, "example" => "12, 42, ..."],
			property: "cultivar",
			description: "Filter by cultivar",
		),
		// 1850 -> 2999
		"year" => new QueryParameter(
			schema: ["type" => "[1-2][8-9][0-9]{2}", "example" => "1993, 2008, ..."],
			property: "year",
			description: "Filter by harvest year",
			castToNativeType: true,
		),
		"q" => new QueryParameter(property: "hydra:freetextQuery", description: "Filter by name"),
		"origin" => new QueryParameter(schema: ["pattern" => "^[a-zA-Z0-9_.]+$"], description: "Filter by origin"),
		"sort" => new QueryParameter(
			schema: ["enum" => ["popularity"]],
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
	uriTemplate: "/tea_types/{slug}/teas",
	uriVariables: ["slug" => new Link(toProperty: "type", fromClass: TeaType::class)],
	normalizationContext: ["groups" => ["tea:read"]],
	denormalizationContext: ["groups" => ["tea:createFromType"]],
	processor: TeaCreateFromTypeProcessor::class,
)]
#[GetCollection(
	uriTemplate: "/members/{username}/tea_lists/{slug}/teas",
	uriVariables: [
		"username" => new Link(
			fromProperty: "username",
			fromClass: Member::class,
			compositeIdentifier: true,
			required: true,
		),
		"slug" => new Link(compositeIdentifier: true, schema: ["pattern" => "/^[a-zA-Z0-9-_]+$/"], required: true),
	],
	paginationEnabled: true,
	normalizationContext: ["groups" => ["tea:read", "embedded:teaType", "with:origin", "embedded:cultivar"]],
	provider: ListedTeaCollectionProvider::class,
)]
class Tea
{
	#[ApiProperty(identifier: true)]
	#[Groups(["tea:read", "embedded:tea", "with:tea"])]
	public ?int $id;

	#[Groups(["tea:create", "tea:read", "embedded:tea", "with:tea"])]
	public TeaFamily $family;

	#[Groups(["tea:create", "tea:read", "embedded:tea", "with:tea"])]
	public ?TeaType $type = null;

	#[ApiProperty(genId: false)]
	#[Groups(["embedded:tea", "with:tea", "with:origin"])]
	public ?OriginPath $originPath = null;

	#[Groups(["tea:create", "tea:read", "tea:createFromType", "with:origin"])]
	public ?Origin $origin = null;

	#[ApiProperty(readableLink: true)]
	#[Groups(["tea:create", "tea:read", "tea:createFromType", "embedded:cultivar"])]
	public ?Cultivar $cultivar = null;

	#[Assert\GreaterThanOrEqual(1800)]
	#[Groups(["tea:create", "tea:read", "tea:createFromType", "embedded:cultivar"])]
	public ?int $year = null;

	#[Groups(["tea:create", "tea:read", "tea:createFromType", "embedded:cultivar"])]
	public ?RoastLevel $roast = null;

	#[Groups(["tea:read"])]
	public \DateTimeImmutable $addedAt;

	public function __construct()
	{
		$this->addedAt = new \DateTimeImmutable();
	}

	#[Groups(["tea:read", "embedded:tea", "with:tea"])]
	public function getDisplayName(): string
	{
		if (null !== $this->type) {
			return $this->type->name;
		}

		return "{$this->family->name} tea";
	}
}
