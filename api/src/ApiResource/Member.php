<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use App\State\Member\MemberProvider;
use App\State\UserProvider;
use Symfony\Component\Serializer\Attribute\Groups;

#[Get(uriTemplate: "/members/me", security: "is_granted('ROLE_USER')", provider: UserProvider::class)]
#[Get(security: "is_granted('ROLE_ADMIN')", provider: MemberProvider::class)]
#[GetCollection(
	normalizationContext: ["groups" => ["role:admin"]],
	security: "is_granted('ROLE_ADMIN')",
	provider: MemberProvider::class,
)]
class Member
{
	#[Groups(["role:admin"])]
	#[ApiProperty(identifier: true)]
	public ?int $id;

	#[Groups(["role:admin"])]
	public string $username;

	#[Groups(["role:admin"])]
	public string $email;
}
