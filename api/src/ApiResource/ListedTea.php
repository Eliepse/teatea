<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Link;
use App\State\Tea\ListedTeaCollectionProvider;
use App\State\TeaList\ListedTeaProvider;

#[ApiResource(
	uriTemplate: "/lists/{listId}/teas/{id}",
	uriVariables: [
		"listId" => new Link(fromProperty: "id", toProperty: "list", fromClass: TeaList::class),
		"id" => new Link(fromProperty: "id", toProperty: "tea", fromClass: Tea::class),
	],
	normalizationContext: ["groups" => ["listedTea:read"]],
	denormalizationContext: ["groups" => ["listedTea:write"]],
	security: "is_granted('ROLE_USER')",
)]
#[Get(provider: ListedTeaProvider::class)]
#[GetCollection(
	uriTemplate: "/lists/{listId}/teas",
	uriVariables: [
		"listId" => new Link(fromProperty: "id", toProperty: "list", fromClass: TeaList::class),
	],
	provider: ListedTeaCollectionProvider::class,
)]
//#[Post(uriTemplate: "/lists/" . TeaListType::Favorites->value . "/teas")]
//#[Post(uriTemplate: "/lists/" . TeaListType::Wishlist->value . "/teas")]
class ListedTea
{
	#[ApiProperty(identifier: true)]
	public int $id;

	public Tea $tea;

	public TeaList $list;

	public \DateTimeImmutable $createdAt;
}
