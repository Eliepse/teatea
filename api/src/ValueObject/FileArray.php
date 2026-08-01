<?php

namespace App\ValueObject;

use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Traversable;

class FileArray implements \ArrayAccess, \Countable, \IteratorAggregate
{
	/** @var (File|UploadedFile)[] */
	private array $files;

	/**
	 * @param (File|UploadedFile)[] $files
	 */
	public function __construct(array $files = [])
	{
		$this->files = array_filter($files, fn($item) => $item instanceof File);
	}

	public function offsetExists(mixed $offset): bool
	{
		return isset($this->files[$offset]);
	}

	public function offsetGet(mixed $offset): File|UploadedFile|null
	{
		return $this->files[$offset] ?? null;
	}

	public function offsetSet(mixed $offset, mixed $value): void
	{
		$this->files[$offset] = $value;
	}

	public function offsetUnset(mixed $offset): void
	{
		unset($this->files[$offset]);
	}

	public function count(): int
	{
		return count($this->files);
	}

	public function getIterator(): Traversable
	{
		return new \ArrayIterator([...$this->files]);
	}
}
