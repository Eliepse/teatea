<?php

namespace App\State\Feed;

use App\ApiResource\Social\Feedable;
use App\Enum\Social\FeedableType;
use App\State\Pagination\Cursor;

final readonly class FeedCursor implements Cursor
{
	public function __construct(
		public int $itemId,
		public FeedableType $itemType,
		public \DateTimeImmutable $publishedAt,
	) {
	}

	public function encode(): string
	{
		return base64_encode(join(".", [$this->publishedAt->getTimestamp(), $this->itemType->value, $this->itemId]));
	}

	public static function decode(?string $encoded): ?self
	{
		if(null === $encoded) {
			return null;
		}

		$decoded = base64_decode($encoded, true) ?: throw new \RuntimeException("Malformed cursor");
		$parts = explode(".", $decoded);

		if (is_numeric($parts[2] ?? null)) {
			$itemId = intval($parts[2]);
		} else {
			throw new \RuntimeException("Invalid cursor");
		}

		$itemType = FeedableType::from($parts[1] ?? null);

		if (is_numeric($parts[0] ?? null)) {
			$publishedAt = new \DateTimeImmutable()->setTimestamp(intval($parts[0]));
		} else {
			throw new \RuntimeException("Invalid cursor");
		}

		return new self($itemId, $itemType, $publishedAt);
	}

	public static function fromFeedable(Feedable $item): ?self
	{
		return new self($item->getId(), $item->getType(), $item->getPublishedAt());
	}

	public function __toString(): string
	{
		return $this->encode();
	}
}
