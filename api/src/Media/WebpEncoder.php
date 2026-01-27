<?php

namespace App\Media;

use App\ValueObject\Size;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\Process\Process;

readonly class WebpEncoder
{
	public function __construct(
		public ?Size $resize = null,
		public ResizeType $resizeType = ResizeType::Stretch,
		public bool $noUpscaling = false,
		public bool $keepAlpha = false,
		public bool $stripMetadata = false,
		public ?int $quality = null,
		public ?int $compressionQuality = null,
	) {}

	/**
	 * @param File $input
	 * @param string|null $outputPathname Return to stdout on null
	 *
	 * @return Process
	 */
	private function toProcess(File $input, ?string $outputPathname): Process
	{
		$params = [];

		if (null !== $this->resize) {
			array_push($params, ...$this->computeResize($input));
		}

		if ($this->stripMetadata) {
			$params[] = "-metadata";
			$params[] = "none";
		}

		if (null !== $this->quality) {
			$params[] = "-q";
			$params[] = min(100, abs($this->quality));
		}

		if (null !== $this->compressionQuality) {
			$params[] = "-m";
			$params[] = min(6, abs($this->compressionQuality));
		}

		$params[] = $this->keepAlpha ? "-exact" : "-noalpha";

		// Input
		$params[] = $input->getPathname();

		// Output params
		$params[] = "-o";
		$params[] = null !== $outputPathname ? $outputPathname : "-";

		return new Process(["/usr/local/bin/cwebp", ...$params]);
	}

	public function toFile(File $input, string $outputPathname): File
	{
		$this->toProcess($input, $outputPathname)->mustRun();
		return new File($outputPathname);
	}

	public function toBase64(File $input): string
	{
		$process = $this->toProcess($input, null)->mustRun();
		return base64_encode($process->getOutput());
	}

	private function computeResize(File $input): array
	{
		if (ResizeType::Stretch === $this->resizeType) {
			return ["-resize", $this->resize->w, $this->resize->h];
		}

		[$w, $h] = getimagesize($input->getPathname());
		$oSize = new Size($w, $h);

		if ($this->resizeType === ResizeType::Contain) {
			$byWidth = $oSize->ratio > $this->resize->ratio;
		} else {
			$byWidth = $oSize->ratio < $this->resize->ratio;
		}

		if ($byWidth) {
			$size = $oSize->w > $this->resize->w ? $oSize->scaleByWidth($this->resize) : null;
		} else {
			$size = $oSize->h > $this->resize->h ? $oSize->scaleByHeight($this->resize) : null;
		}

		return null !== $size ? ["-resize", $size->w, $size->h] : [];
	}
}
