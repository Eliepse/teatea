<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Post;
use App\Enum\TeaListType;
use App\State\TeaList\TeaListCollectionProvider;
use App\State\TeaList\TeaListProcessor;
use App\State\TeaList\TeaListProvider;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(
	normalizationContext: ["groups" => ["teaList:read"]],
	denormalizationContext: ["groups" => ["teaList:write"]],
	security: "is_granted('ROLE_USER')"
)]
#[Get(uriTemplate: "/collections/{id}", provider: TeaListProvider::class)]
#[GetCollection(
	uriTemplate: "/members/{username}/collections",
	uriVariables: ["username" => new Link(fromProperty: "username", toProperty: "owner", fromClass: Member::class)],
	provider: TeaListCollectionProvider::class,
)]
#[Post(
	uriTemplate: "/members/{username}/collections",
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
	public TeaListType $type;

	#[Groups(["teaList:read"])]
	public Member $owner;
}
