<?php

namespace App\Enum;

enum RoastLevel: string
{
	case No = "no";
	case Yes = "yes";
	case Low = "light";
	case Mild = "mild";
	case Strong = "strong";
}
