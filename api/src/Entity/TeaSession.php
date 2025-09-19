<?php

namespace App\Entity;

use App\DTO\SteepValue;
use App\Enum\BrewingTechnic;
use App\Repository\TeaSessionRepository;
use App\ValueObject\Duration;
use App\ValueObject\Temperature;
use App\ValueObject\Volume;
use App\ValueObject\Weight;
use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TeaSessionRepository::class)]
class TeaSession
{
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
			if($raw["key"] === $steep->key) {
				$this->steeps[$i] = $steep->toArray();
				return;
			}
		}

		// Fallback on adding a new one
		$this->steeps = [...($this->steeps ?? []), $steep->toArray()];
	}
}
