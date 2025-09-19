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
	 * @param SteepValue $steep
	 *
	 * @return void
	 */
	public function addSteep(SteepValue $steep): void
	{
		if (array_any($this->steeps ?? [], fn($data) => $data["key"] === $steep->key)) {
			throw new \RuntimeException("Trying to add a steep that already exists");
		}

		$normalizedStep = [
			"key" => $steep->key,
			"dur" => $steep->duration->seconds,
			"deg" => $steep->temperature?->degrees ?: null,
		];

		$this->steeps = [...($this->steeps ?? []), $normalizedStep];
	}

	/**
	 * @return SteepValue[]
	 */
	public function getSteeps(): array
	{
		return array_map(
			fn($data) => new SteepValue(
				$data["key"],
				new Duration($data["dur"]),
				$data["deg"] ? new Temperature($data["deg"]) : null,
			),
			$this->steeps ?? [],
		);
	}
}
