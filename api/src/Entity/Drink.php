<?php

namespace App\Entity;

use App\Enum\BrewingTechnic;
use App\Repository\DrinkRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DrinkRepository::class)]
class Drink
{
	#[ORM\Id]
	#[ORM\GeneratedValue]
	#[ORM\Column]
	public readonly int $id;

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
