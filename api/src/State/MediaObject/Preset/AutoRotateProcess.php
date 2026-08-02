<?php

namespace App\State\MediaObject\Preset;

use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\Process\Process;

class AutoRotateProcess extends Process
{
	public function __construct(File $file) {
		parent::__construct([
			"convert",
			"-auto-orient",
			"-limit",
			"memory",
			"16MiB",
			"-format",
			"jpg",
			$file->getPathname(),
			$file->getPathname(),
		]);
	}
}
