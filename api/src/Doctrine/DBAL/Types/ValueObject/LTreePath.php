<?php

namespace App\Doctrine\DBAL\Types\ValueObject;

use RuntimeException;

final readonly class LTreePath implements \Stringable
{
	/**
	 * @param string[] $nodes
	 */
	public function __construct(
		private array $nodes,
	) {
		$this->validate($nodes);
	}

	public function __toString(): string
	{
		return join(".", $this->nodes);
	}

	public static function fromString(string $pathString): self
	{
		return new self(explode(".", $pathString));
	}

	private function validate(array $path): void
	{
		foreach ($path as $node) {
			if (false === ctype_alnum(str_replace("_", "", $node))) {
				throw new RuntimeException("Invalid path node");
			}
		}
	}

	/**
	 * @return string[]
	 */
	public function getNodes(): array
	{
		return $this->nodes;
	}
}
