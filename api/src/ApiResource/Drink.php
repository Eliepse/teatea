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
use App\Enum\BrewingTechnic;
use App\State\Drink\DrinkCreateProcessor;
use App\State\Drink\DrinkDeleteProcessor;
use App\State\Drink\DrinkEditProcessor;
use App\State\Drink\DrinkProvider;
use App\State\Drink\TeaDrinksPaginatedProvider;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(security: "is_granted('ROLE_USER')")]
#[Get(
	normalizationContext: ["embedded:brewingStep", "embedded:originPath"],
	provider: DrinkProvider::class,
)]
#[GetCollection(
	normalizationContext: ["groups" => ["drink:read", "embedded:tea", "embedded:teaType", "embedded:originPath"]],
	security: "is_granted('ROLE_USER')",
	provider: DrinkProvider::class,
)]
#[Post(denormalizationContext: ["groups" => ["drink:create"]], processor: DrinkCreateProcessor::class)]
#[Patch(
	denormalizationContext: ["groups" => ["drink:edit"]],
	provider: DrinkProvider::class,
	processor: DrinkEditProcessor::class,
)]
#[Delete(provider: DrinkProvider::class, processor: DrinkDeleteProcessor::class)]
#[GetCollection(
	uriTemplate: "/teas/{teaId}/drinks",
	uriVariables: ["teaId" => new Link(toProperty: "tea", fromClass: Tea::class)],
	paginationEnabled: true,
	paginationItemsPerPage: 15,
	paginationMaximumItemsPerPage: 50,
	paginationClientItemsPerPage: true,
	normalizationContext: ["groups" => ["drink:minimal"]],
	security: "is_granted('ROLE_USER')",
	provider: TeaDrinksPaginatedProvider::class,
	parameters: [
		"contentful" => new QueryParameter(
			schema: ["type" => "boolean"],
			description: "When true, consider only drinks that have at least a note, water or tea volume set",
			castToNativeType: true,
		),
		"sort" => new QueryParameter(
			schema: ["enum" => ["date"]],
			openApi: new OpenApiParameter(name: "enum", in: "query"),
			description: "Sorting method",
		),
	],
)]
class Drink
{
	#[Groups(["drink:read", "drink:minimal"])]
	#[ApiProperty(identifier: true)]
	public ?int $id = null;

	#[Groups(["drink:create", "drink:read"])]
	#[ApiProperty(readable: true, readableLink: true)]
	public Tea $tea;

	#[Groups(["drink:create", "drink:read", "drink:minimal"])]
	public ?BrewingTechnic $technic = null;

	#[Assert\Length(max: 1000)]
	#[Groups(["drink:create", "drink:edit", "drink:read", "drink:minimal"])]
	public ?string $note = null;

	/**
	 * Tea quantity in grams
	 */
	#[Assert\GreaterThan(0)]
	#[Groups(["drink:create", "drink:edit", "drink:read", "drink:minimal"])]
	public ?float $teaQuantity = null;

	/**
	 * Water quantity in ml
	 */
	#[Assert\GreaterThan(0)]
	#[Groups(["drink:create", "drink:edit", "drink:read", "drink:minimal"])]
	public ?float $waterMl = null;

	/** @var BrewingStep[] */
	#[Groups(["drink:edit", "embedded:brewingStep"])]
	#[ApiProperty(genId: false)]
	#[Link(toProperty: "drinkId")]
	public array $brewingSteps = [];

	#[Groups(["drink:create", "drink:read", "drink:minimal"])]
	public ?\DateTimeImmutable $drankAt;

	public function __construct()
	{
		$this->drankAt = new \DateTimeImmutable();
	}
}
