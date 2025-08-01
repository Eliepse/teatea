<?php

namespace App\Entity;

use App\DTO\BrewingStep;
use App\Enum\BrewingTechnic;
use App\Repository\DrinkRepository;
use App\ValueObject\Duration;
use App\ValueObject\Temperature;
use App\ValueObject\Volume;
use App\ValueObject\Weight;
use DateTimeImmutable;
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

	/** @var array<BrewingStep> */
	#[ORM\Column(type: Types::JSONB, nullable: true)]
	private ?array $brewingSteps = null;

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
		public readonly ?DateTimeImmutable $drankAt = null,
	) {
	}

	/**
	 * @param BrewingStep $step
	 *
	 * @return int
	 */
	public function addBrewingStep(BrewingStep $step): int
	{
		$normalizedStep = ["deg" => $step->temperature->degrees, "sec" => $step->duration->seconds];
		$lastStep = array_slice($this->brewingSteps ?? [], -1)[0] ?? null;

		// Initiate the array of steps
		if (null === $lastStep) {
			$this->brewingSteps = [[...$normalizedStep, "i" => 1]];
			return 1;
		}

		// Push a new step
		$i = $lastStep["i"] + 1;
		$this->brewingSteps[] = [...$normalizedStep, "i" => $i];

		return $i;
	}

	/**
	 * @return array<int, BrewingStep>
	 */
	public function getBrewingStepsMap(): array
	{
		return array_reduce(
			$this->brewingSteps ?? [],
			function ($map, $step) {
				$map[$step["i"]] = new BrewingStep(new Temperature($step["deg"]), new Duration($step["sec"]));
				return $map;
			},
			[],
		);
	}

	public function removeBrewingStep(int $index): bool
	{
		$key = array_find_key($this->brewingSteps, fn($bs) => $index === $bs["i"]);

		if (null === $key) {
			return false;
		}

		array_splice($this->brewingSteps, $key, 1);

		// Prevent empty array to optimize storage and queries
		if (0 === count($this->brewingSteps)) {
			$this->brewingSteps = null;
		}

		return true;
	}
}
