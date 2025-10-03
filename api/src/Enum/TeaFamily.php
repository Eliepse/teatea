<?php

namespace App\Enum;

enum TeaFamily: string
{
	/** @var string[] Values to be used on ApiResource QueryParameter */
	const array QUERY_PARAMS = ["white", "yellow", "green", "wulong", "black", "fermented"];

	case White = "white";
	case Yellow = "yellow";
	case Green = "green";
	case Wulong = "wulong";
	case Black = "black";
	case Fermented = "fermented";
}
