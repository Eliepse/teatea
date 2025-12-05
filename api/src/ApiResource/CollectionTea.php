<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\QueryParameter;
use App\Enum\TeaFamily;
use App\State\CollectionTea\CollectionTeaCollectionProvider;
use App\State\CollectionTea\CollectionTeaCreateProcessor;
use App\State\CollectionTea\CollectionTeaProvider;
use Symfony\Component\Serializer\Attribute\Groups;


#[ApiResource(
	normalizationContext: ["groups" => ["tea:read", "embedded:teaType", "embedded:origin", "embedded:cultivar"]],
	denormalizationContext: ["groups" => ["create:collectTea"]],
	security: "is_granted('ROLE_USER')",
)]
#[Get(
	uriTemplate: "/members/{username}/teas/{id}",
	uriVariables: [
		"username" => new Link(
			fromProperty: "username",
			fromClass: Member::class,
			compositeIdentifier: true,
			required: true,
		),
		"id" => new Link(identifiers: ["id"]),
	],
	normalizationContext: ["groups" => ["tea:read", "embedded:teaType", "embedded:origin", "embedded:cultivar"]],
	provider: CollectionTeaProvider::class
)]
#[GetCollection(
	uriTemplate: "/members/{username}/teas",
	uriVariables: [
		"username" => new Link(
			fromProperty: "username",
			fromClass: Member::class,
			compositeIdentifier: true,
			required: true,
		),
		"id" => new Link(identifiers: ["id"]),
	],
	paginationEnabled: true,
	paginationItemsPerPage: 15,
	paginationMaximumItemsPerPage: 50,
	paginationClientItemsPerPage: true,
	normalizationContext: ["groups" => ["tea:read", "embedded:teaType", "embedded:origin", "embedded:cultivar"]],
	provider: CollectionTeaCollectionProvider::class,
	parameters: [
		"family" => new QueryParameter(
			schema: ["enum" => TeaFamily::QUERY_PARAMS],
			description: "Filter by family",
			castToNativeType: true,
		),
	],
)]
#[Post(
	uriTemplate: "/members/{username}/teas",
	uriVariables: [
		"username" => new Link(
			fromProperty: "username",
			fromClass: Member::class,
			compositeIdentifier: true,
			required: true,
		),
	],
	processor: CollectionTeaCreateProcessor::class,
)]
class CollectionTea
{
	#[ApiProperty(identifier: true)]
	public ?int $id;

	public Member $owner;

	#[Groups(["with:tea", "create:collectTea"])]
	public Tea $tea;

	public ?string $description = null;
}
