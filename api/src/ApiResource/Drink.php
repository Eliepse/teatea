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
use App\Enum\BrewingTechnic;
use App\State\Drink\DrinkCreateProcessor;
use App\State\Drink\DrinkDeleteProcessor;
use App\State\Drink\DrinkEditProcessor;
use App\State\Drink\DrinkProvider;
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
class Drink
{
	#[Groups(["drink:read"])]
	#[ApiProperty(identifier: true)]
	public ?int $id = null;

	#[Groups(["drink:create", "drink:read"])]
	#[ApiProperty(readable: true, readableLink: true)]
	public Tea $tea;

	#[Groups(["drink:create", "drink:read"])]
	public ?BrewingTechnic $technic = null;

	#[Assert\Length(max: 1000)]
	#[Groups(["drink:create", "drink:edit", "drink:read"])]
	public ?string $note = null;

	/**
	 * Tea quantity in grams
	 */
	#[Assert\GreaterThan(0)]
	#[Groups(["drink:create", "drink:edit", "drink:read"])]
	public ?float $teaQuantity = null;

	/**
	 * Water quantity in ml
	 */
	#[Assert\GreaterThan(0)]
	#[Groups(["drink:create", "drink:edit", "drink:read"])]
	public ?float $waterMl = null;

	/** @var BrewingStep[] */
	#[Groups(["drink:edit", "embedded:brewingStep"])]
	#[ApiProperty(genId: false)]
	#[Link(toProperty: "drinkId")]
	public array $brewingSteps = [];

	#[Groups(["drink:create", "drink:read"])]
	public ?\DateTimeImmutable $drankAt;

	public function __construct()
	{
		$this->drankAt = new \DateTimeImmutable();
	}
}
