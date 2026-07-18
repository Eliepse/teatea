<?php

namespace App\State\Pagination;

interface Cursor extends \Stringable
{
	public function encode(): string;

	public static function decode(string $encoded): ?self;
}
