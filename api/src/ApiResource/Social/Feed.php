<?php

namespace App\ApiResource\Social;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use App\Serializer\HideIdentifierInterface;
use App\State\Feed\FeedCursor;
use App\State\Feed\FeedPaginatedProvider;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Serializer\Attribute\Ignore;

#[ApiResource(
	uriTemplate: "/feed",
	normalizationContext: [
		"groups" => [
			"feed",
			"with:post",
			"with:tea_session",
			"with:tea",
			"with:business",
			"with:teatype",
			"teaSession:read",
			"with:origin",
			"embedded:cultivar",
		]
	],
)]
#[GetCollection(
	paginationViaCursor: [
		["field" => "cursor", "direction" => "DESC"],
	],
	paginationEnabled: true,
	paginationType: "cursor",
	paginationItemsPerPage: 8,
	paginationMaximumItemsPerPage: 50,
	paginationPartial: true,
	provider: FeedPaginatedProvider::class,
)]
#[Groups(["feed"])]
class Feed implements HideIdentifierInterface
{
	public function __construct(
		#[Ignore]
		public readonly FeedCursor $cursor,
		public readonly Feedable $item,
	) {
	}

	public function getPublishedAt(): \DateTimeImmutable
	{
		return $this->item->getPublishedAt();
	}
}
