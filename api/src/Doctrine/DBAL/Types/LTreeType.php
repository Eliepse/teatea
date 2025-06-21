<?php

namespace App\Doctrine\DBAL\Types;

use App\Doctrine\DBAL\Types\ValueObject\LTreePath;
use Doctrine\DBAL\Platforms\AbstractPlatform;
use Doctrine\DBAL\Types\Type;
use RuntimeException;

/**
 * Implementation of PostgreSQL ltree data type.
 *
 * @see https://www.postgresql.org/docs/17/ltree.html
 */
class LTreeType extends Type
{
	public function getSQLDeclaration(array $column, AbstractPlatform $platform): string
	{
		return "ltree";
	}

	public function convertToDatabaseValue($value, AbstractPlatform $platform): ?string
	{
		if ($value === null) {
			return null;
		}

		if (!$value instanceof LTreePath) {
			throw new RuntimeException("Invalid type. Expected LTreePath");
		}

		return (string)$value;
	}

	public function convertToPHPValue($value, AbstractPlatform $platform): ?LTreePath
	{
		if ($value === null) {
			return null;
		}

		if (!\is_string($value)) {
			throw new RuntimeException("Invalid type, expected a string.");
		}

		return LTreePath::fromString($value);
	}

	public function getMappedDatabaseTypes(AbstractPlatform $platform): array
	{
		return ["ltree"];
	}
}
