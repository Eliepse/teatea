<?php

namespace App\ApiResource\Social;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\QueryParameter;
use App\ApiResource\Member;
use App\Serializer\HideIdentifierInterface;
use App\State\Feed\FeedCursor;
use App\State\Feed\FeedPaginatedProvider;
use App\Validator\Username;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Serializer\Attribute\Ignore;

#[ApiResource(
	uriTemplate: "/feed",
	normalizationContext: [
		"groups" => [
			"feed",
			"post:read",
			"teaSession:read",
			"with:tea",
			"with:business",
			"with:teatype",
			"with:origin",
			"with:media",
			"embedded:cultivar",
		],
	],
	security: "is_granted('ROLE_USER')",
)]
#[GetCollection(
	paginationViaCursor: [
		["field" => "cursor", "direction" => "DESC"],
	],
	paginationEnabled: true,
	paginationType: "cursor",
	paginationMaximumItemsPerPage: 64,
	paginationPartial: true,
	paginationClientItemsPerPage: true,
	provider: FeedPaginatedProvider::class,
	parameters: [
		new QueryParameter("username", constraints: [new Username()]),
	],
)]
readonly class Feed implements HideIdentifierInterface
{
	public function __construct(
		#[Ignore]
		public FeedCursor $cursor,
		#[Groups(["feed"])]
		public Feedable $item,
	) {
	}

	#[Groups(["feed"])]
	public function getPublishedAt(): \DateTimeImmutable
	{
		return $this->item->getPublishedAt();
	}

	#[Groups(["feed"])]
	public function getAuthor(): ?Member
	{
		return $this->item->getAuthor();
	}
}
