<?php

namespace App\Enum;

enum TeaListType: string
{
	case Favorites = "favorites";
	case Wishlist = "wishlist";
//	case Tasted = "tasted";
	case Custom = "custom";
}
