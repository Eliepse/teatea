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
use App\Enum\TeaFamily;
use App\State\CollectionTea\CollectionTeaCollectionProvider;
use App\State\CollectionTea\CollectionTeaCreateProcessor;
use App\State\CollectionTea\CollectionTeaDeleteProcessor;
use App\State\CollectionTea\CollectionTeaEditProcessor;
use App\State\CollectionTea\CollectionTeaProvider;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(
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
	normalizationContext: [
		"groups" => [
			"read:collectionTea",
			"with:tea",
			"with:business",
			"with:origin",
			"with:media",
			"embedded:teaType",
			"embedded:cultivar",
		],
	],
	security: "is_granted('ROLE_USER') and user.username === request.attributes.get('username')",
)]
#[Get(provider: CollectionTeaProvider::class)]
#[GetCollection(
	uriTemplate: "/members/{username}/teas",
	uriVariables: [
		"username" => new Link(
			fromProperty: "username",
			fromClass: Member::class,
			compositeIdentifier: true,
			required: true,
		),
	],
	paginationEnabled: true,
	paginationItemsPerPage: 15,
	paginationMaximumItemsPerPage: 50,
	paginationClientItemsPerPage: true,
	provider: CollectionTeaCollectionProvider::class,
	parameters: [
		"family" => new QueryParameter(
			schema: ["enum" => TeaFamily::QUERY_PARAMS],
			description: "Filter by family",
			required: false,
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
	denormalizationContext: ["groups" => ["create:collectionTea"]],
	processor: CollectionTeaCreateProcessor::class,
)]
#[Patch(
	denormalizationContext: ["groups" => ["edit:collectionTea"]],
	provider: CollectionTeaProvider::class,
	processor: CollectionTeaEditProcessor::class,
)]
#[Delete(provider: CollectionTeaProvider::class, processor: CollectionTeaDeleteProcessor::class)]
#[Groups(["read:collectionTea"])]
class CollectionTea
{
	#[ApiProperty(identifier: true)]
	public ?int $id;

	public Member $owner;

	#[Groups(["create:collectionTea"])]
	public Tea $tea;

	#[Groups(["create:collectionTea", "edit:collectionTea"])]
	public ?string $description = null;

	#[Groups(["create:collectionTea", "edit:collectionTea"])]
	public ?\DateTimeImmutable $acquiredAt = null;

	// When the last grams of tea has been drank
	#[Groups(["edit:collectionTea"])]
	public ?\DateTimeImmutable $finishedAt = null;

	#[Groups(["edit:collectionTea"])]
	public ?int $rating = null;

	public ?MediaObject $thumbnail = null;
}
