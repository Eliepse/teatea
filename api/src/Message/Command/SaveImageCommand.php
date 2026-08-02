<?php

namespace App\Message\Command;

use App\Doctrine\HasMedia;
use App\ValueObject\FileArray;

readonly class SaveImageCommand
{
	public function __construct(
		public HasMedia $owner,
		public FileArray $images,
		/*
		 * Limit the amount of images that the owner can have.
		 * Older images are removed to allow inserting the new
		 * ones. If null, there is no limit!
		 */
		public ?int $ownerMaxImages = null,
	) {
		if (null !== $this->ownerMaxImages && 0 >= $this->ownerMaxImages) {
			throw new \RuntimeException("Max images must be greater than 0, or null");
		}
	}
}
