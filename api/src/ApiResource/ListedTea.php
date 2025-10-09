<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Post;
use App\Enum\TeaListPivotType;
use App\State\TeaList\ListedTeaCollectionProvider;
use App\State\TeaList\ListedTeaProvider;
use App\State\TeaList\NativeListedTeaCollectionProvider;
use App\State\TeaList\NativeListedTeaProcessor;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(
//	normalizationContext: ["groups" => ["listedTea:read"]],
//	denormalizationContext: ["groups" => ["listedTea:write"]],
	security: "is_granted('ROLE_USER')",
)]
#[Get(
	uriTemplate: "/listed-teas/{id}",
//	uriVariables: [
//		"listId" => new Link(fromProperty: "id", toProperty: "list", fromClass: TeaList::class),
//		"id" => new Link(fromProperty: "id", toProperty: "tea", fromClass: Tea::class),
//	],
	provider: ListedTeaProvider::class,
)]
#[GetCollection(
	uriTemplate: "/lists/favorites/teas",
	normalizationContext: ["groups" => ["listedTea:read", "embedded:tea", "embedded:origin", "embedded:teaType", "embedded:cultivar"]],
	provider: NativeListedTeaCollectionProvider::class,
	extraProperties: ["list" => TeaListPivotType::Favorites],
)]
#[Post(
	uriTemplate: "/lists/favorites/teas",
	denormalizationContext: ["groups" => "listedTea:write-native"],
	processor: NativeListedTeaProcessor::class,
	extraProperties: ["list" => TeaListPivotType::Favorites],
)]
#[GetCollection(
	uriTemplate: "/lists/wishlist/teas",
	provider: NativeListedTeaCollectionProvider::class,
	extraProperties: ["list" => TeaListPivotType::Wishlist],
)]
//#[Post(uriTemplate: "/lists/wishlist/teas")]
#[GetCollection(
	uriTemplate: "/lists/{listId}/teas",
	uriVariables: [
		"listId" => new Link(fromProperty: "id", toProperty: "list", fromClass: TeaList::class),
	],
	provider: ListedTeaCollectionProvider::class,
)]
class ListedTea
{
	#[ApiProperty(identifier: true)]
	#[Groups(["listedTea:read"])]
	public int $id;

	#[Groups(["listedTea:write-native", "listedTea:read"])]
	public Tea $tea;

	#[Groups(["listedTea:read"])]
	public ?TeaList $list = null;

	#[Groups(["listedTea:read"])]
	public TeaListPivotType $type;

	#[Groups(["listedTea:read"])]
	public \DateTimeImmutable $createdAt;
}
