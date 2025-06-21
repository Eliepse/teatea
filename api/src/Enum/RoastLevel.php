<?php

namespace App\Enum;

enum RoastLevel: int {
    case Any = 0;
    case Low = 1;
    case Mild = 2;
    case Strong = 3;
}
