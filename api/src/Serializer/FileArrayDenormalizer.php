<?php

namespace App\Serializer;

use App\ValueObject\FileArray;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Serializer\Normalizer\DenormalizerInterface;

/**
 * Prevents `File` fields to be denormalized
 */
class FileArrayDenormalizer implements DenormalizerInterface
{
	public function denormalize(mixed $data, string $type, ?string $format = null, array $context = []): FileArray
	{
		return new FileArray($data);
	}

	public function supportsDenormalization(mixed $data, string $type, ?string $format = null, array $context = []): bool
	{
		return is_a($type, FileArray::class, true);
	}

	public function getSupportedTypes(?string $format): array
	{
		if("multipart" !== $format) {
			return [];
		}

		return [FileArray::class => true];
	}
}
