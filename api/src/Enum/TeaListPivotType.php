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

	static public function tryFromSlug(string $slug): TeaListPivotType|null
	{
		return array_find(self::cases(), fn($case) => $slug === strtolower($case->name));
	}
}
