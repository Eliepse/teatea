<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\QueryParameter;
use App\State\Origin\OriginCollectionProvider;
use App\State\Origin\OriginProcessor;
use App\State\Origin\OriginProvider;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
	normalizationContext: ["groups" => ["origin:read"]],
	denormalizationContext: ["groups" => ["origin:write"]],
	security: "is_granted('ROLE_USER')",
)]
#[Get(uriTemplate: "/origins/{path}", provider: OriginProvider::class)]
#[GetCollection(
	normalizationContext: ["groups" => ["origin:read"]],
	provider: OriginCollectionProvider::class,
	parameters: [
		"parent" => new QueryParameter(schema: [
			"pattern" => "^[a-zA-Z0-9_.]+$",
		], description: "Only return descendant from the given path"),
		"level" => new QueryParameter(
			schema: ["type" => "integer", "min" => 1, "max" => 3],
			description: "Determine the specific level to return (1: country, 2: Region, 3: locality)",
			castToNativeType: true,
		),
		"sort" => new QueryParameter(schema: ["enum" => ["popularity", "name"]], description: "Order of returned origins"),
		"limit" => new QueryParameter(
			schema: ["type" => "integer", "min" => 1],
			description: "Max origins to return",
			castToNativeType: true,
		),
	],
)]
#[Post(processor: OriginProcessor::class)]
class Origin
{
	#[ApiProperty(identifier: true)]
	#[Groups(["origin:read", "with:origin"])]
	public string $path;

	#[Assert\NotBlank]
	#[Assert\Length(min: 2, max: 24)]
	#[Assert\Regex("/^[\p{L}_\-0-9 ]+$/u")]
	#[Groups(["origin:read", "with:origin", "origin:write"])]
	public string $name;

	#[Groups(["origin:read", "with:origin"])]
	public array $namePath = [];

	#[Groups(["origin:read"])]
	public bool $isLeaf = true;

	#[Groups(["origin:read"])]
	public bool $proposal = true;

	#[Groups(["origin:write"])]
	public ?string $parentPath = null;
}
