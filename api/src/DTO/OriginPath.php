<?php

namespace App\DTO;

use App\ApiResource\Origin;
use Symfony\Component\Serializer\Attribute\Groups;

readonly class OriginPath
{
	public function __construct(
		#[Groups(["embedded:tea", "embedded:origin"])]
		public Origin $country,
		#[Groups(["embedded:tea", "embedded:origin"])]
		public ?Origin $region = null,
		#[Groups(["embedded:tea", "embedded:origin"])]
		public ?Origin $locality = null,
	) {
		if (null === $this->region && null !== $this->locality) {
			throw new \RuntimeException("An OriginPath's locality cannot be set without a region");
		}
	}

	public static function fromNodes(array $nodes): ?OriginPath
	{
		if (0 === count($nodes)) {
			return null;
		}

		$country = $nodes[0];
		$region = $nodes[1] ?? null;
		$locality = $nodes[2] ?? null;

		if (false === is_a($country, Origin::class)) {
			throw new \RuntimeException("Invalid country node");
		}

		if (null !== $region && false === is_a($region, Origin::class)) {
			throw new \RuntimeException("Invalid region node");
		}

		if (null !== $locality && false === is_a($locality, Origin::class)) {
			throw new \RuntimeException("Invalid locality node");
		}

		return new OriginPath(
			$nodes[0],
			$nodes[1] ?? null,
			$nodes[2] ?? null,
		);
	}
}
