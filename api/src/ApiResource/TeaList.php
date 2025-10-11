<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Link;
use App\State\TeaList\TeaListCollectionProvider;
use App\State\TeaList\TeaListProvider;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(
	uriTemplate: "/lists/{slug}",
	uriVariables: ["slug" => new Link(identifiers: ["slug"])],
	normalizationContext: ["groups" => ["teaList:read"]],
	denormalizationContext: ["groups" => ["teaList:write"]],
	security: "is_granted('ROLE_USER')",
	provider: TeaListProvider::class
)]
#[Get]
#[GetCollection(
	uriTemplate: "/members/{username}/lists",
	uriVariables: ["username" => new Link(fromProperty: "username", toProperty: "owner", fromClass: Member::class)],
	provider: TeaListCollectionProvider::class,
)]
class TeaList
{
	#[ApiProperty(identifier: false)]
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
