<?php

namespace App\State\Pagination;

use ApiPlatform\State\Pagination\HasNextPagePaginatorInterface;
use ApiPlatform\State\Pagination\PartialPaginatorInterface;
use Traversable;

readonly class CursorPaginator implements \IteratorAggregate, \Countable, PartialPaginatorInterface,
                                          HasNextPagePaginatorInterface
{
	public function __construct(
		public array $items,
		public float $itemsPerPage,
		public ?Cursor $nextCursor = null,
	) {
	}

	public function getIterator(): Traversable
	{
		return new \ArrayIterator($this->items);
	}

	public function count(): int
	{
		return count($this->items);
	}

	public function getCurrentPage(): float
	{
		return 1.0;
	}

	public function getItemsPerPage(): float
	{
		return $this->itemsPerPage;
	}

	public function hasNextPage(): bool
	{
		return null !== $this->nextCursor;
	}
}
