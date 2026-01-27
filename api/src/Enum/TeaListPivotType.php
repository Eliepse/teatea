<?php

namespace App\Enum;

enum TeaListPivotType: int
{
	case Custom = 0;
	case Favorites = 1;
	case Wishlist = 2;

	public function getSlug(): string
	{
		return strtolower(self::Favorites->name);
	}

	public static function tryFromSlug(string $slug): ?TeaListPivotType
	{
		return array_find(self::cases(), fn($case) => $slug === strtolower($case->name));
	}
}
