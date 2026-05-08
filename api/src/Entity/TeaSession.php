<?php

namespace App\Entity;

use App\Doctrine\ORM\TimestampedEntity;
use App\DTO\SteepValue;
use App\Enum\BrewingQuality;
use App\Enum\BrewingTechnic;
use App\Repository\TeaSessionRepository;
use App\ValueObject\Volume;
use App\ValueObject\Weight;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Clock\DatePoint;

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

	#[ORM\Column(nullable: true)]
	public ?BrewingTechnic $technic = null;

	public function __construct(
		#[ORM\ManyToOne(inversedBy: "sessions")]
		#[ORM\JoinColumn(nullable: false)]
		public readonly Tea $tea,

		#[ORM\ManyToOne(inversedBy: "sessions")]
		#[ORM\JoinColumn(nullable: false)]
		public readonly User $author,

		#[ORM\Column(type: "date_point")]
		public readonly ?DatePoint $drankAt = null,
	) {
	}

	/**
	 * @return SteepValue[]
	 */
	public function getSteeps(): array
	{
		return array_map(fn($data) => SteepValue::fromArray($data), $this->steeps ?? []);
	}

	/**
	 * @param SteepValue[] $steeps
	 */
	public function setSteeps(array $steeps): self
	{
		$this->steeps = array_map(fn($steep) => $steep->toArray(), $steeps);
		return $this;
	}
}
