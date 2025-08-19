<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\State\Member\MemberCreateProcessor;
use App\State\Member\MemberProvider;
use App\State\UserProvider;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[Get(uriTemplate: "/members/me", security: "is_granted('ROLE_USER')", provider: UserProvider::class)]
#[Get(security: "is_granted('ROLE_ADMIN')", provider: MemberProvider::class)]
#[GetCollection(normalizationContext: ["groups" => ["role:admin"]], security: "is_granted('ROLE_ADMIN')", provider: MemberProvider::class,)]
#[Post(denormalizationContext: [
		"groups",
		"member:create"
	], security: "is_granted('ROLE_ADMIN')", processor: MemberCreateProcessor::class,)]
class Member
{
	#[Groups(["role:admin"])]
	#[ApiProperty(identifier: true)]
	public ?int $id;

	#[Assert\Regex("/^[a-zA-Z0-9_]{2,16}$/")]
	#[Assert\NotBlank(groups: ["member:onboarding"])]
	#[Groups(["role:admin"])]
	public ?string $username;

	#[Assert\Email]
	#[Groups(["role:admin", "member:create"])]
	public string $email;

	/** @var string[] */
	#[Groups(["role:admin"])]
	public array $roles = [];
}
