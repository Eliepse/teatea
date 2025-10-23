<?php

namespace App\Entity;

use App\Doctrine\ORM\TimestampedEntity;
use App\DTO\SteepValue;
use App\Enum\BrewingQuality;
use App\Enum\BrewingTechnic;
use App\Repository\TeaSessionRepository;
use App\ValueObject\Volume;
use App\ValueObject\Weight;
use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TeaSessionRepository::class)]
class TeaSession
{
	use TimestampedEntity;

	#[ORM\Id]
	#[ORM\GeneratedValue]
	#[ORM\Column]
	public ?int $id;

	#[ORM\Column(type: Types::TEXT, nullable: true)]
	public ?string $note = null;

	#[ORM\Column(type: "weight", nullable: true)]
	public ?Weight $teaQuantity = null;

	#[ORM\Column(type: "volume", nullable: true)]
	public ?Volume $waterVolume = null;

	/** @var array<SteepValue> */
	#[ORM\Column(type: Types::JSONB, nullable: true)]
	private ?array $steeps = null;

	#[ORM\Column(nullable: true)]
	public ?BrewingQuality $quality = null;

	#[ORM\ManyToOne]
	#[ORM\JoinColumn]
	public ?Business $place = null;

	public function __construct(
		#[ORM\ManyToOne(inversedBy: 'sessions')]
		#[ORM\JoinColumn(nullable: false)]
		public readonly Tea $tea,

		#[ORM\ManyToOne(inversedBy: "sessions")]
		#[ORM\JoinColumn(nullable: false)]
		public readonly User $author,

		#[ORM\Column(nullable: true)]
		public ?BrewingTechnic $technic = null,

		#[ORM\Column(type: Types::DATETIMETZ_IMMUTABLE)]
		public readonly ?DateTimeImmutable $drankAt = null,
	) {
	}

	/**
	 * @return SteepValue[]
	 */
	public function getSteeps(): array
	{
		return array_map(fn($data) => SteepValue::fromArray($data), $this->steeps ?? []);
	}

	public function persistSteep(SteepValue $steep): void
	{
		// Edit an existing steep (if exists)
		foreach ($this->steeps ?? [] as $i => $raw) {
			if ($raw["key"] === $steep->key) {
				$this->steeps[$i] = $steep->toArray();
				return;
			}
		}

		// Fallback on adding a new one
		$this->steeps = [...($this->steeps ?? []), $steep->toArray()];
	}

	public function removeSteep(SteepValue|string $value): void
	{
		$key = $value instanceof SteepValue ? $value->key : $value;
		$original = $this->steeps ?? [];

		// Delete the steep
		$filtered = array_values(array_filter($original, fn($raw) => $raw["key"] !== $key));

		// Check if a steep has been correctly deleted
		if (count($original) === count($filtered)) {
			throw new \RuntimeException("Steep '$key' doesn't exist");
		}

		// Save the change
		$this->steeps = $filtered;
	}
}
