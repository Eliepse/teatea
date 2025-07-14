<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Get;
use App\State\UserProvider;

#[Get(uriTemplate: "/members/me", security: "is_granted('ROLE_USER')", provider: UserProvider::class)]
#[Get(security: "is_granted('ROLE_USER')")]
class Member
{
	#[ApiProperty(identifier: true)]
	public ?int $id;

	public string $username;

//	public string $email;
}
