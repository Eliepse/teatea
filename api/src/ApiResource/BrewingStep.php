<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Post;
use App\State\Drink\BrewingStepCreateProcessor;
use App\State\Drink\BrewingStepDeleteProcessor;
use App\State\Drink\BrewingStepProvider;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints\GreaterThanOrEqual;

#[ApiResource]
#[Get(
	uriTemplate: "/drinks/{drinkId}/brewing-steps/{id}",
	uriVariables: [
		"drinkId" => new Link(fromProperty: "drink", fromClass: Drink::class),
		"id" => new Link(fromProperty: "index", fromClass: BrewingStep::class),
	],
	provider: BrewingStepProvider::class,
)]
#[Post(
	uriTemplate: "/drinks/{drinkId}/brewing-steps",
	uriVariables: ["drinkId" => new Link(fromProperty: "drink", fromClass: Drink::class)],
	processor: BrewingStepCreateProcessor::class,
)]
#[Delete(
	uriTemplate: "/drinks/{drinkId}/brewing-steps/{id}",
	uriVariables: [
		"drinkId" => new Link(fromProperty: "drink", fromClass: Drink::class),
		"id" => new Link(fromProperty: "index", fromClass: BrewingStep::class),
	],
	provider: BrewingStepProvider::class,
	processor: BrewingStepDeleteProcessor::class,
)]
class BrewingStep
{
	#[GreaterThanOrEqual(1)]
	#[ApiProperty(readable: false, identifier: true)]
	public int $index;

	#[ApiProperty(readable: false)]
	public Drink $drink;

	#[GreaterThanOrEqual(1)]
	#[Groups(["embedded:brewingStep"])]
	public int $temperature;

	#[GreaterThanOrEqual(1)]
	#[Groups(["embedded:brewingStep"])]
	public int $duration;

	public function __construct()
	{
		$this->drink = new Drink();
	}
}
