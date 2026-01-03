<?php

namespace App\ValueObject;

readonly class Size
{
	public float $ratio;

	public function __construct(
		public int $w,
		public int $h,
	) {
		$this->ratio = $this->w / $this->h;
	}

	/**
	 * 1  : Landscape
	 * 0  : Square
	 * -1 : Portrait
	 * @return int
	 */
	public function orientation(): int
	{
		if (1 > $this->ratio) {
			return -1;
		}

		if (1 < $this->ratio) {
			return 1;
		}

		return 0;
	}

	public function scaleByWidth(Size $target): Size
	{
		return new Size($target->w, ($this->h * $target->w) / $this->w);
	}

	public function scaleByHeight(Size $target): Size
	{
		return new Size(($this->w * $target->h) / $this->h, $target->h);
	}
}
