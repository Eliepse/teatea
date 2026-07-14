<?php

namespace App\ApiResource\Social;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post as ApiPost;
use App\ApiResource\Member;
use App\State\Post\PostCreateProcessor;
use App\State\Post\PostPaginatedProvider;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(denormalizationContext: ["groups" => ["post:write"]])]
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
	public ?int $id = null;

	public Member $author;

	#[Groups(["post:write"])]
	public string $content;

	public \DateTimeImmutable $createdAt;

	public \DateTimeImmutable $updatedAt;
}
