<?php

namespace App\Serializer;

use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

final readonly class HideIdentifierJsonLDNormalizer implements NormalizerInterface
{
	public function __construct(
		#[Autowire(service: "api_platform.jsonld.normalizer.object")]
		private NormalizerInterface $inner,
	) {
	}

	public function normalize(
		mixed $data,
		?string $format = null,
		array $context = [],
	): array|string|int|float|bool|\ArrayObject|null {
		$normalized = $this->inner->normalize($data, $format, $context);

		unset($normalized["@id"]);

		return $normalized;
	}

	public function supportsNormalization(mixed $data, ?string $format = null, array $context = []): bool
	{
		return $data instanceof HideIdentifierInterface && $this->inner->supportsNormalization(
				$data,
				$format,
				$context,
			);
	}

	public function getSupportedTypes(?string $format): array
	{
		return $this->inner->getSupportedTypes($format);
	}
}
