<?php

namespace App\Enum;

enum BrewingQuality: int
{
	case Good = 2;
	case Improvable = 0;
	case Bad = -2;
}
