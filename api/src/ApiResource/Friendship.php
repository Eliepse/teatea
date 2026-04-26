<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\QueryParameter;
use App\State\Friendship\DecideFriendshipRequestProcessor;
use App\State\Friendship\FriendshipCollectionProvider;
use Symfony\Component\Routing\Requirement\Requirement;
use Symfony\Component\Serializer\Attribute\Groups;

#[GetCollection(
	uriTemplate: "/members/{username}/friendships",
	uriVariables: [
		"username" => new Link(
			fromProperty: "username",
			fromClass: Member::class,
			compositeIdentifier: true,
			required: true,
		),
	],
	normalizationContext: ["groups" => ["friendship:read", "with:member"]],
	security: "is_granted('ROLE_USER') and request.attributes.get('username') === user.username",
	provider: FriendshipCollectionProvider::class,
	parameters: [
		"status" => new QueryParameter(schema: ["enum" => ["pending"]], required: true),
	]
)]
#[Post(
	uriTemplate: "/friendships/{id}/{decision}",
	uriVariables: ["id" => new Link(required: true)],
	requirements: [
		"id" => Requirement::POSITIVE_INT,
		"decision" => "^(accept|reject)$",
	],
	security: "is_granted('ROLE_USER')",
	deserialize: false,
	processor: DecideFriendshipRequestProcessor::class,
)]
#[Groups(["friendship:read"])]
class Friendship
{
	#[ApiProperty(identifier: true)]
	public int $id;

	public Member $requestor;

	public ?\DateTimeImmutable $requestedAt = null;
}
