<?php

namespace App\ApiResource\Social;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post as ApiPost;
use App\ApiResource\Member;
use App\Enum\Social\FeedableType;
use App\State\Post\PostCreateProcessor;
use App\State\Post\PostPaginatedProvider;
use App\State\Post\PostProvider;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Serializer\Attribute\Ignore;

#[ApiResource(
	normalizationContext: ["groups" => ["post:read", "with:post"]],
	denormalizationContext: ["groups" => ["post:write"]],
	security: "is_granted('ROLE_USER')",
)]
#[Get(processor: PostProvider::class)]
#[ApiPost(processor: PostCreateProcessor::class)]
#[GetCollection(
	paginationEnabled: true,
	paginationItemsPerPage: 15,
	paginationMaximumItemsPerPage: 50,
	paginationClientItemsPerPage: true,
	provider: PostPaginatedProvider::class,
)]
class Post implements Feedable
{
	#[ApiProperty(identifier: true)]
	#[Groups(["post:read", "with:post"])]
	public ?int $id = null;

	#[Groups(["post:read"])]
	public Member $author;

	#[Groups(["post:read", "post:write"])]
	public string $content;

	#[Groups(["post:read"])]
	public \DateTimeImmutable $createdAt;

	#[Groups(["post:read"])]
	public \DateTimeImmutable $updatedAt;

	#[Groups(["post:read", "with:post"])]
	public function getId(): int
	{
		return $this->id;
	}

	#[Ignore]
	public function getType(): FeedableType
	{
		return FeedableType::Post;
	}

	#[Ignore]
	public function getPublishedAt(): \DateTimeImmutable
	{
		return $this->createdAt;
	}
}
