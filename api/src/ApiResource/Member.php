<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\State\Member\FriendCollectionProvider;
use App\State\Member\MemberCreateProcessor;
use App\State\Member\MemberOnboardingProcessor;
use App\State\Member\MemberProvider;
use App\State\UserProvider;
use App\State\UserStatsProvider;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[Get(uriTemplate: "/members/{username}", provider: MemberProvider::class)]
#[Get(
	uriTemplate: "/me",
	normalizationContext: ["groups" => ["member:self"]],
	security: "is_granted('ROLE_USER') or is_granted('ROLE_ONBOARDING')",
	provider: UserProvider::class,
)]
#[Get(
	uriTemplate: "/members/{username}/stats",
	uriVariables: ["username" => new Link(fromProperty: "username")],
	normalizationContext: [
		"groups" => [
			"member:stats",
			"embedded:tea",
			"with:origin",
			"embedded:teaType",
			"with:teatype",
		]
	],
	security: "is_granted('ROLE_USER')",
	provider: UserStatsProvider::class,
)]
#[GetCollection(
	normalizationContext: ["groups" => ["role:admin"]],
	security: "is_granted('ROLE_ADMIN')",
	provider: MemberProvider::class,
)]
#[Post(
	denormalizationContext: ["groups" => "member:create"],
	security: "is_granted('ROLE_ADMIN')",
	processor: MemberCreateProcessor::class,
)]
#[Patch(
	uriTemplate: "/members/{id}/onboarding",
	uriVariables: ["id" => new Link(fromProperty: "id")],
	denormalizationContext: ["groups" => "member:onboarding"],
	security: "is_granted('ROLE_ONBOARDING')",
	provider: MemberProvider::class,
	processor: MemberOnboardingProcessor::class,
)]
#[GetCollection(
	uriTemplate: "/members/{username}/friends",
	normalizationContext: [],
	security: "is_granted('ROLE_USER') and request.attributes.get('username') === user.username",
	provider: FriendCollectionProvider::class,
)]
class Member
{
	#[Groups(["role:admin", "member:self", "member:stats"])]
	#[ApiProperty(identifier: false)]
	public ?int $id;

	#[ApiProperty(identifier: true)]
	#[Assert\Regex("/^[\p{L}_]{2,16}$/")]
	#[Assert\NotBlank(groups: ["member:onboarding"])]
	#[Groups(["role:admin", "member:onboarding", "member:self", "embedded:member", "with:member", "auth:guest"])]
	public ?string $username;

	#[Assert\Email]
	#[Groups(["role:admin", "member:create", "member:self"])]
	public string $email;

	/** @var string[] */
	#[Groups(["member:self", "role:admin"])]
	#[ApiProperty(security: "object.username === user?.username or is_granted('ROLE_ADMIN')")]
	public array $roles = [];

	#[Groups(["member:stats"])]
	public int $statsSessionsTotal = 0;

	#[Groups(["member:stats"])]
	public int $statsConsumedTeasTotal = 0;

	#[Groups(["member:stats"])]
	public float $statsConsumedTeaKgTotal = 0;

	/** @var Tea[] */
	#[Groups(["member:stats"])]
	public array $statsTopTeas = [];

	/** @var TeaType[] */
	#[Groups(["member:stats"])]
	public array $statsTopTeaTypes = [];

	public ?\DateTimeImmutable $friendshipped_at = null;
	public ?bool $friendship_requested = null;
	public ?bool $friendship_rejected = null;
}
