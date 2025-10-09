<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Post;
use App\Enum\TeaListPivotType;
use App\State\TeaList\NativeTeaListProvider;
use App\State\TeaList\TeaListCollectionProvider;
use App\State\TeaList\TeaListProcessor;
use App\State\TeaList\TeaListProvider;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(
	normalizationContext: ["groups" => ["teaList:read"]],
	denormalizationContext: ["groups" => ["teaList:write"]],
	security: "is_granted('ROLE_USER')"
)]
#[Get(
	uriTemplate: "/lists/favorites",
	provider: NativeTeaListProvider::class,
	extraProperties: ["list" => TeaListPivotType::Favorites],
)]
#[Get(
	uriTemplate: "/lists/wishlist",
	provider: NativeTeaListProvider::class,
	extraProperties: ["list" => TeaListPivotType::Wishlist],
)]
#[Get(uriTemplate: "/lists/{id}", provider: TeaListProvider::class)]
#[GetCollection(
	uriTemplate: "/members/{username}/lists",
	uriVariables: ["username" => new Link(fromProperty: "username", toProperty: "owner", fromClass: Member::class)],
	provider: TeaListCollectionProvider::class,
)]
#[Post(
	uriTemplate: "/members/{username}/lists",
	uriVariables: ["username" => new Link(fromProperty: "username", toProperty: "owner", fromClass: Member::class)],
	processor: TeaListProcessor::class,
)]
class TeaList
{
	#[ApiProperty(identifier: true)]
	#[Groups(["teaList:read"])]
	public int $id;

	#[ApiProperty(identifier: true)]
	#[Groups(["teaList:read"])]
	public string $slug;

	#[Groups(["teaList:read", "teaList:write"])]
	public string $name;

	#[Groups(["teaList:read"])]
	public Member $owner;
}
