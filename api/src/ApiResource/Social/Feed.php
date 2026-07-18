<?php

namespace App\ApiResource\Social;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use App\Serializer\HideIdentifierInterface;
use App\State\Feed\FeedCursor;
use App\State\Feed\FeedPaginatedProvider;
use Symfony\Component\Serializer\Attribute\Ignore;

#[ApiResource(uriTemplate: "/feed")]
#[GetCollection(
	paginationViaCursor: [
		["field" => "cursor", "direction" => "DESC"],
	],
	paginationType: "cursor",
	paginationItemsPerPage: 20,
	paginationMaximumItemsPerPage: 50,
	paginationPartial: true,
	provider: FeedPaginatedProvider::class,
)]
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
