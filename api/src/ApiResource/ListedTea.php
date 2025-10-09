<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Link;
use App\Enum\TeaListPivotType;
use App\State\TeaList\ListedTeaCollectionProvider;
use App\State\TeaList\ListedTeaProvider;
use App\State\TeaList\NativeListedTeaCollectionProvider;

#[ApiResource(
	normalizationContext: ["groups" => ["listedTea:read"]],
	denormalizationContext: ["groups" => ["listedTea:write"]],
	security: "is_granted('ROLE_USER')",
)]
#[Get(
	uriTemplate: "/lists/{listId}/teas/{id}",
	uriVariables: [
		"listId" => new Link(fromProperty: "id", toProperty: "list", fromClass: TeaList::class),
		"id" => new Link(fromProperty: "id", toProperty: "tea", fromClass: Tea::class),
	],
	provider: ListedTeaProvider::class,
)]
#[GetCollection(
	uriTemplate: "/lists/favorites/teas",
	provider: NativeListedTeaCollectionProvider::class,
	extraProperties: ["list" => TeaListPivotType::Favorites],
)]
#[GetCollection(
	uriTemplate: "/lists/wishlist/teas",
	provider: NativeListedTeaCollectionProvider::class,
	extraProperties: ["list" => TeaListPivotType::Wishlist],
)]
#[GetCollection(
	uriTemplate: "/lists/{listId}/teas",
	uriVariables: [
		"listId" => new Link(fromProperty: "id", toProperty: "list", fromClass: TeaList::class),
	],
	provider: ListedTeaCollectionProvider::class,
)]
//#[Post(uriTemplate: "/lists/favorites/teas")]
//#[Post(uriTemplate: "/lists/wishlist/teas")]
class ListedTea
{
	#[ApiProperty(identifier: true)]
	public int $id;

	public Tea $tea;

	public TeaList $list;

	public TeaListPivotType $type;

	public \DateTimeImmutable $createdAt;
}
