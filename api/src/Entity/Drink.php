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
	 * @param int|null $position
	 *
	 * @return int Return the position the step has been insterted to
	 */
	public function addBrewingStep(BrewingStep $step, ?int $position = null): int
	{
		if (null !== $position && 0 > $position) {
			throw new \RuntimeException("Cannot insert a brewing step to a zero or negative position");
		}

		$index = min(count($this->brewingSteps ?? []), $position - 1);

		$this->brewingSteps ??= [];

		array_splice(
			$this->brewingSteps,
			$index,
			0,
			[["deg" => $step->temperature->degrees, "sec" => $step->duration->seconds]],
		);

		return $index + 1;
	}

	/**
	 * @return array<BrewingStep>
	 */
	public function getBrewingSteps(): array
	{
		return array_map(
			fn($step) => new BrewingStep(new Temperature($step["deg"]), new Duration($step["sec"])),
			$this->brewingSteps ?? [],
		);
	}

	public function removeBrewingStep(int $index): bool
	{
		$realIndex = $index - 1;
		if (false === isset($this->brewingSteps[$realIndex])) {
			return false;
		}

		array_splice($this->brewingSteps, $realIndex, 1);
		return true;
	}
}
