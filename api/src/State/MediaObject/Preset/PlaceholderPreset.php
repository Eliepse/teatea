<?php

namespace App\State\MediaObject\Preset;

use App\Media\WebpEncoder;
use App\ValueObject\Size;

readonly class PlaceholderPreset extends WebpEncoder
{
	public function __construct()
	{
		parent::__construct(
			resize: new Size(3, 3),
			keepAlpha: false,
			stripMetadata: true,
			quality: 25,
			compressionQuality: 6,
		);
	}
}
