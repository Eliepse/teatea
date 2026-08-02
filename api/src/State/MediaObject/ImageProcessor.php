<?php

namespace App\State\MediaObject;

use App\State\MediaObject\Preset\AutoRotateProcess;
use App\State\MediaObject\Preset\OptimizedPreset;
use App\State\MediaObject\Preset\PlaceholderPreset;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\File\File;

readonly class ImageProcessor
{
	public function __construct(
		private LoggerInterface $logger,
	) {
	}

	/**
	 * Autorotate the given image with ImageMagick by reading the Exif "Orientation"
	 */
	public function autoRotate(File $file): void
	{
		try {
			$exif = @exif_read_data($file->getPathname(), null) ?: [];

			if (in_array($exif["Orientation"], [3, 5, 6, 7, 8], true)) {
				new AutoRotateProcess($file)->mustRun();
			}
		} catch (\Throwable $e) {
			$this->logger->error("Failed to autorotate the image: " . $e->getMessage());
		}
	}

	public function optimize(File $file): void
	{
		new OptimizedPreset()->toFile($file, $file);
	}

	public function placeholder(File $file): string
	{
		return new PlaceholderPreset()->toBase64($file);
	}

	public function process(File $file): string
	{
		$this->autoRotate($file);
		$this->optimize($file);
		return $this->placeholder($file);
	}
}
