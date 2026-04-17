<?php

namespace App\Doctrine\DBAL\Types\ValueObject;

use RuntimeException;
use Symfony\Component\Serializer\Attribute\Ignore;

final readonly class LTreePath implements \Stringable
{
	public function __construct(
		/** @var string[] */
		private array $nodes,
	) {
		$this->validate($nodes);
	}

	public function __toString(): string
	{
		return $this->getPath();
	}

	public static function fromString(string $pathString): self
	{
		return new self(explode(".", $pathString));
	}

	private function validate(array $path): void
	{
		foreach ($path as $node) {
			if (false === ctype_alnum(str_replace("_", "", $node))) {
				throw new RuntimeException("Invalid path node: {$this->getPath()}");
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

	#[Ignore]
	public function getPath()
	{
		return join(".", $this->nodes);
	}

	#[Ignore]
	public function getParentPath(): ?string
	{
		if (1 === count($this->nodes)) {
			return null;
		}

		return join(".", array_slice($this->nodes, 0, -1));
	}

	public function isParent(string|LTreePath $path): bool
	{
		$haystack = $path instanceof LTreePath ? $path->getPath() : $path;
		return str_starts_with("$haystack.", $this->getPath() . ".");
	}

	public function isDescendant(string|LTreePath $path): bool
	{
		$needle = $path instanceof LTreePath ? $path->getPath() : $path;
		return str_starts_with($this->getPath() . ".", "$needle.");
	}

	public function level(): int
	{
		return count($this->nodes);
	}
}
