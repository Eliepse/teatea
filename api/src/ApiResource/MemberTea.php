<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Post;
use App\Enum\TeaListPivotType;
use App\State\MemberTea\MemberTeaProvider;
use App\State\MemberTea\NativeListMemberTeaCollectionProvider;
use App\State\MemberTea\NativeListMemberTeaProcessor;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(
	normalizationContext: [
		"groups" => [
			"listedTea:read",
			"embedded:tea",
			"embedded:origin",
			"embedded:teaType",
			"embedded:cultivar"
		]
	],
	denormalizationContext: ["groups" => ["listedTea:write"]],
	security: "is_granted('ROLE_USER')",
)]
#[Get(
	uriTemplate: "/members/{username}/teas/{pivotId}",
	uriVariables: [
		"username" => new Link(fromProperty: "username", toProperty: "author", fromClass: Member::class),
		"pivotId" => new Link(identifiers: ["id"]),
	],
	provider: MemberTeaProvider::class
)]
#[GetCollection(
	uriTemplate: "/members/{username}/teas",
	provider: NativeListMemberTeaCollectionProvider::class,
	extraProperties: ["list" => TeaListPivotType::Favorites],
)]
#[Post(
	uriTemplate: "/lists/favorites/teas",
	denormalizationContext: ["groups" => "listedTea:write-native"],
	processor: NativeListMemberTeaProcessor::class,
	extraProperties: ["list" => TeaListPivotType::Favorites],
)]
#[GetCollection(
	uriTemplate: "/lists/wishlist/teas",
	provider: NativeListMemberTeaCollectionProvider::class,
	extraProperties: ["list" => TeaListPivotType::Wishlist],
)]
class MemberTea
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
	public Member $author;

	#[Groups(["listedTea:read"])]
	public \DateTimeImmutable $createdAt;
}
