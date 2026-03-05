<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\QueryParameter;
use ApiPlatform\OpenApi\Model\Parameter as OpenApiParameter;
use App\Enum\BrewingQuality;
use App\Enum\BrewingTechnic;
use App\State\TeaSession\TeaSessionCreateProcessor;
use App\State\TeaSession\TeaSessionDeleteProcessor;
use App\State\TeaSession\TeaSessionEditProcessor;
use App\State\TeaSession\TeaSessionProvider;
use App\State\TeaSession\TeaSessionsPaginatedProvider;
use Symfony\Component\Clock\DatePoint;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(normalizationContext: [
	"groups" => [
		"teaSession:read",
		"embedded:tea",
		"embedded:teaType",
		"with:origin",
		"embedded:cultivar",
		"with:business",
	],
], security: "is_granted('ROLE_USER')")]
#[Get(normalizationContext: ["groups" => [
	"embedded:steep",
	"teaSession:read",
	"embedded:tea",
	"with:origin",
	"embedded:cultivar",
	"with:business",
]], provider: TeaSessionProvider::class)]
#[Post(denormalizationContext: ["groups" => ["teaSession:create"]], processor: TeaSessionCreateProcessor::class)]
#[Patch(
	denormalizationContext: ["groups" => ["teaSession:edit"]],
	provider: TeaSessionProvider::class,
	processor: TeaSessionEditProcessor::class,
)]
#[Delete(provider: TeaSessionProvider::class, processor: TeaSessionDeleteProcessor::class)]
#[GetCollection(
	paginationEnabled: true,
	paginationItemsPerPage: 15,
	paginationMaximumItemsPerPage: 50,
	paginationClientItemsPerPage: true,
	normalizationContext: [
		"groups" => [
			"teaSession:read",
			"embedded:tea",
			"embedded:teaType",
			"embedded:member",
			"embedded:cultivar",
			"with:business",
			"with:origin",
		],
	],
	security: "is_granted('ROLE_USER')",
	provider: TeaSessionsPaginatedProvider::class,
	parameters: [
		"tea" => new QueryParameter(schema: ["type" => "integer", "minimum" => 1]),
		"member" => new QueryParameter(schema: ["pattern" => "/^[\p{L}_]{2,16}$/"]),
		"contentful" => new QueryParameter(
			schema: ["type" => "boolean"],
			description: "When true, consider only sessions that have at least a note, water or tea volume set",
			castToNativeType: true,
		),
		"sort" => new QueryParameter(
			schema: ["enum" => ["date"]],
			openApi: new OpenApiParameter(name: "enum", in: "query"),
			description: "Sorting method",
		),
	],
)]
class TeaSession
{
	#[Groups(["teaSession:read", "teaSession:minimal"])]
	#[ApiProperty(identifier: true)]
	public ?int $id = null;

	#[Groups(["teaSession:create", "teaSession:read"])]
	#[ApiProperty(readable: true, readableLink: true)]
	public Tea $tea;

	#[Groups(["teaSession:create", "teaSession:read", "teaSession:minimal"])]
	public ?BrewingTechnic $technic = null;

	#[Assert\Length(max: 1000)]
	#[Groups(["teaSession:create", "teaSession:edit", "teaSession:read", "teaSession:minimal"])]
	public ?string $note = null;

	/**
	 * Tea quantity in grams
	 */
	#[Assert\GreaterThan(0)]
	#[Groups(["teaSession:create", "teaSession:edit", "teaSession:read", "teaSession:minimal"])]
	public ?float $teaQuantity = null;

	/**
	 * Water quantity in ml
	 */
	#[Assert\GreaterThan(0)]
	#[Groups(["teaSession:create", "teaSession:edit", "teaSession:read", "teaSession:minimal"])]
	public ?float $waterMl = null;

	/** @var Steep[] */
	#[Groups(["teaSession:edit", "embedded:steep"])]
	#[ApiProperty(genId: false)]
	#[Link(toProperty: "sessionId")]
	public array $steeps = [];

	#[Groups(["teaSession:create", "teaSession:read", "teaSession:minimal", "teaSession:edit"])]
	public ?BrewingQuality $quality = null;

	#[Groups(["teaSession:read"])]
	public Member $author;

	#[Groups(["teaSession:create", "teaSession:read", "teaSession:minimal"])]
	public ?DatePoint $drankAt;

	#[Groups(["teaSession:create", "teaSession:read", "teaSession:edit", "with:business"])]
	public ?Business $place = null;

	public function __construct()
	{
		$this->drankAt = new DatePoint();
	}
}
