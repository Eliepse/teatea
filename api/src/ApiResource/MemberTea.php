<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\QueryParameter;
use App\Enum\TeaListPivotType;
use App\State\MemberTea\MemberTeaDeleteProcessor;
use App\State\MemberTea\MemberTeaProvider;
use App\State\MemberTea\NativeListMemberTeaCollectionProvider;
use App\State\MemberTea\NativeListMemberTeaProcessor;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(
	uriTemplate: "/lists/{slug}/teas/{id}",
	uriVariables: [
		"slug" => new Link(fromProperty: "slug", toProperty: "list", fromClass: TeaList::class),
		"id" => new Link(identifiers: ["id"]),
	],
	normalizationContext: [
		"groups" => ["listedTea:read", "embedded:tea", "embedded:origin", "embedded:teaType", "embedded:cultivar"],
	],
	denormalizationContext: ["groups" => ["listedTea:write"]],
	security: "is_granted('ROLE_USER')",
	provider: MemberTeaProvider::class,
)]
#[Get]
#[Delete(processor: MemberTeaDeleteProcessor::class)]
#[Post(
	uriTemplate: "/lists/favorites/teas",
	uriVariables: [],
	denormalizationContext: ["groups" => "listedTea:write-native"],
	processor: NativeListMemberTeaProcessor::class,
	extraProperties: ["list" => TeaListPivotType::Favorites],
)]
#[GetCollection(
	uriTemplate: "/lists/favorites/teas",
	uriVariables: [],
	provider: NativeListMemberTeaCollectionProvider::class,
	parameters: ["tea" => new QueryParameter(schema: ["type" => "integer", "minimum" => 1], castToNativeType: true)],
	extraProperties: ["list" => TeaListPivotType::Favorites],
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
