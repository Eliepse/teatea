<?php

namespace App\Doctrine\DBAL\Types;

use App\ValueObject\Weight;
use Doctrine\DBAL\Platforms\AbstractPlatform;
use Doctrine\DBAL\Types\Type;
use RuntimeException;

class WeightType extends Type
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

		if (!$value instanceof Weight) {
			throw new RuntimeException("Invalid type. Expected Weight");
		}

		return $value->value;
	}

	public function convertToPHPValue($value, AbstractPlatform $platform): ?Weight
	{
		if ($value === null) {
			return null;
		}

		if (!\is_numeric($value)) {
			throw new RuntimeException("Expected a numeric value.");
		}

		return new Weight(floatval($value));
	}

	public function getMappedDatabaseTypes(AbstractPlatform $platform): array
	{
		return ["DECIMAL"];
	}
}
