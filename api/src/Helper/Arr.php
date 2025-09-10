<?php

namespace App\Helper;

final readonly class Arr
{
	public static function pluck(array $array, string|callable $key, bool $unique = false): array
	{
		$extractor = is_string($key) ? fn($i) => is_array($i) ? $i[$key] : $i->$key : $key;
		return $unique ? array_unique(array_map($extractor, $array)) : array_map($extractor, $array);
	}
}
