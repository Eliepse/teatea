<?php

namespace App\Doctrine\DBAL\Types;

use Doctrine\DBAL\Platforms\AbstractPlatform;
use Doctrine\DBAL\Types\DateTimeImmutableType;
use Symfony\Component\Clock\DatePoint;

final class DatePointPostgresType extends DateTimeImmutableType
{
	public const string NAME = 'date_point';

	public function getSQLDeclaration(array $column, AbstractPlatform $platform): string
	{
		return 'DATE';
	}

	/**
	 * @param T $value
	 *
	 * @return (T is null ? null : DatePoint)
	 *
	 * @template T
	 */
	public function convertToPHPValue(mixed $value, AbstractPlatform $platform): ?DatePoint
	{
		if (null === $value || $value instanceof DatePoint) {
			return $value;
		}

		$value = parent::convertToPHPValue($value, $platform);

		return DatePoint::createFromInterface($value);
	}

	public function getName(): string
	{
		return self::NAME;
	}
}
