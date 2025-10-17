<?php

namespace App\Doctrine\DBAL\Types;

use App\Enum\RoastLevel;
use Doctrine\DBAL\Platforms\AbstractPlatform;
use Doctrine\DBAL\Types\Type;

class RoastLevelType extends Type
{
	public const string TYPE = "RoastLevel";

	public function getSQLDeclaration(array $column, AbstractPlatform $platform): string
	{
		$elements = ["RoastLevel"];

		$elements[] = $column["notnull"] ? "NOT NULL" : "NULL";

		if (false === empty($column["default"])) {
			$elements[] = "DEFAULT {$column["default"]}";
		}

		return join(" ", $elements);
	}

	public function convertToDatabaseValue($value, AbstractPlatform $platform): ?string
	{
		if ($value === null) {
			return null;
		}

		assert($value instanceof RoastLevel);
		return $value->value;
	}

	public function convertToPHPValue($value, AbstractPlatform $platform): ?RoastLevel
	{
		if ($value === null) {
			return null;
		}

		assert(is_string($value));
		return RoastLevel::tryFrom($value);
	}

	public function getMappedDatabaseTypes(AbstractPlatform $platform): array
	{
		return [self::TYPE];
	}
}
