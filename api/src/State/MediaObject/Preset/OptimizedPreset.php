<?php

namespace App\State\MediaObject\Preset;

use App\Media\ResizeType;
use App\Media\WebpEncoder;
use App\ValueObject\Size;

readonly class OptimizedPreset extends WebpEncoder
{
	public function __construct()
	{
		parent::__construct(
			resize: new Size(2000, 1500),
			resizeType: ResizeType::Contain,
			noUpscaling: true,
			keepAlpha: false,
			stripMetadata: true,
			quality: 70,
			compressionQuality: 4,
		);
	}
}
