<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\State\TeaSession\SteepCreateProcessor;
use App\State\TeaSession\SteepDeleteProcessor;
use App\State\TeaSession\SteepPatchProcessor;
use App\State\TeaSession\SteepProvider;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Serializer\Attribute\Ignore;
use Symfony\Component\Validator\Constraints\GreaterThanOrEqual;

#[ApiResource(security: "is_granted('ROLE_USER')")]
#[Get(
	uriTemplate: "/teaSessions/{sessionId}/steeps/{key}",
	uriVariables: [
		"sessionId" => new Link(fromProperty: "id", toProperty: "session", fromClass: TeaSession::class),
		"key" => new Link(fromProperty: "key"),
	],
	provider: SteepProvider::class,
)]
#[Post(
	uriTemplate: "/teaSessions/{sessionId}/steeps",
	uriVariables: ["sessionId" => new Link(fromProperty: "id", toProperty: "session", fromClass: TeaSession::class)],
	processor: SteepCreateProcessor::class,
)]
#[Patch(
	uriTemplate: "/teaSessions/{sessionId}/steeps/{key}",
	uriVariables: [
		"sessionId" => new Link(fromProperty: "id", toProperty: "session", fromClass: TeaSession::class),
		"key" => new Link(fromProperty: "key"),
	],
	provider: SteepProvider::class,
	processor: SteepPatchProcessor::class,
)]
#[Delete(
	uriTemplate: "/teaSessions/{sessionId}/steeps/{key}",
	uriVariables: [
		"sessionId" => new Link(fromProperty: "id", toProperty: "session", fromClass: TeaSession::class),
		"key" => new Link(fromProperty: "key"),
	],
	provider: SteepProvider::class,
	processor: SteepDeleteProcessor::class,
)]
#[Groups(["embedded:steep"])]
class Steep
{
	#[ApiProperty(writable: false, identifier: true)]
	public string $key;

	// Here only to let ApiPlatform generate the URI
	#[Ignore]
	public TeaSession $session;

	#[GreaterThanOrEqual(1)]
	public int $duration;

	#[GreaterThanOrEqual(1)]
	public ?int $temperature = null;
}
