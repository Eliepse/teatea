<?php

namespace App\Doctrine\DBAL\Types;

use App\ValueObject\Volume;
use Doctrine\DBAL\Platforms\AbstractPlatform;
use Doctrine\DBAL\Types\Type;
use RuntimeException;

class VolumeType extends Type
{
	public function getSQLDeclaration(array $column, AbstractPlatform $platform): string
	{
		return "DECIMAL";
	}

	public function convertToDatabaseValue($value, AbstractPlatform $platform): ?float
	{
		if ($value === null) {
			return null;
		}

		if (!$value instanceof Volume) {
			throw new RuntimeException("Invalid type. Expected Volume");
		}

		return $value->value;
	}

	public function convertToPHPValue($value, AbstractPlatform $platform): ?Volume
	{
		if ($value === null) {
			return null;
		}

		if (!\is_numeric($value)) {
			throw new RuntimeException("Expected a numeric value.");
		}

		return new Volume($value);
	}

	public function getMappedDatabaseTypes(AbstractPlatform $platform): array
	{
		return ["DECIMAL", "NUMERIC"];
	}
}
