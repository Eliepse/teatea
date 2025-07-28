<?php

namespace App\Entity;

use App\Enum\BrewingTechnic;
use App\Repository\DrinkRepository;
use App\ValueObject\Volume;
use App\ValueObject\Weight;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DrinkRepository::class)]
class Drink
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

	public function __construct(
		#[ORM\ManyToOne(inversedBy: 'drinks')]
		#[ORM\JoinColumn(nullable: false)]
		public readonly Tea $tea,

		#[ORM\ManyToOne(inversedBy: "drinks")]
		#[ORM\JoinColumn(nullable: false)]
		public readonly User $drinker,

		#[ORM\Column(nullable: true)]
		public ?BrewingTechnic $technic = null,

		#[ORM\Column]
		public readonly ?\DateTimeImmutable $drankAt = null,
	) {
	}
}
