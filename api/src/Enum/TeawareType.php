<?php

namespace App\Enum;

enum TeawareType: string {
    case Gaiwan = "gaiwan";
	case Yixing = "yixing";
	case Kyusu = "kyusu";
	case Shiboridashi = "shiboridashi";
	case Hohin = "hohin";
	case Chawan = "chawan";
	case Tajeon = "tajeon";
	case Teapot = "teapot";
	case Bottle = "bottle";
	case FrenchPress = "press";
	case Mug = "mug";
	case Other = "other";
}
