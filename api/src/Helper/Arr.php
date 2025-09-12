<?php

namespace App\Helper;

final readonly class Arr
{
	public static function pluck(array $array, string|callable $key, bool $unique = false): array
	{
		$extractor = is_string($key) ? fn($i) => is_array($i) ? $i[$key] : $i->$key : $key;
		return $unique ? array_unique(array_map($extractor, $array)) : array_map($extractor, $array);
	}

	/**
	 * @template T
	 * @param array<T> $array
	 * @param string|(callable(T $item): mixed) $key
	 *
	 * @return array
	 */
	public static function keyBy(array $array, string|callable $key): array
	{
		$extractor = is_string($key) ? fn($item) => (is_object($item) ? $item->{$key} : $item[$key]) : $key;
		return array_reduce($array, function ($map, $item) use ($extractor) {
			$map[$extractor($item)] = $item;
			return $map;
		}, []);
	}
}
