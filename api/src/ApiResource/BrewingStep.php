<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Post;
use App\State\TeaSession\BrewingStepCreateProcessor;
use App\State\TeaSession\BrewingStepDeleteProcessor;
use App\State\TeaSession\BrewingStepProvider;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints\GreaterThanOrEqual;

#[ApiResource(security: "is_granted('ROLE_USER')")]
#[Get(
	uriTemplate: "/teaSessions/{sessionId}/brewing-steps/{id}",
	uriVariables: [
		"sessionId" => new Link(fromProperty: "session", fromClass: TeaSession::class),
		"id" => new Link(fromClass: BrewingStep::class),
	],
	provider: BrewingStepProvider::class,
)]
#[Post(
	uriTemplate: "/teaSessions/{sessionId}/brewing-steps",
	uriVariables: ["sessionId" => new Link(fromProperty: "session", fromClass: TeaSession::class)],
	processor: BrewingStepCreateProcessor::class,
)]
#[Delete(
	uriTemplate: "/teaSessions/{sessionId}/brewing-steps/{id}",
	uriVariables: [
		"sessionId" => new Link(fromProperty: "session", fromClass: TeaSession::class),
		"id" => new Link(fromClass: BrewingStep::class),
	],
	provider: BrewingStepProvider::class,
	processor: BrewingStepDeleteProcessor::class,
)]
class BrewingStep
{
	#[ApiProperty(readable: false)]
	public TeaSession $session;

	#[GreaterThanOrEqual(1)]
	#[Groups(["embedded:brewingStep"])]
	public int $temperature;

	#[GreaterThanOrEqual(1)]
	#[Groups(["embedded:brewingStep"])]
	public int $duration;

	public function __construct(
		#[ApiProperty(readable: false, identifier: true)]
		public ?int $id = null,
	) {
		$this->session = new TeaSession();
	}
}
