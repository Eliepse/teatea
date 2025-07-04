<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use App\Enum\RoastLevel;
use App\Enum\TeaFamily;
use App\Repository\TeaRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Serializer\Attribute\Ignore;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: TeaRepository::class)]
#[ApiResource(normalizationContext: ["groups" => ["tea:list"]], security: "is_granted('ROLE_USER')")]
class Tea
{
	#[ORM\Id]
	#[ORM\GeneratedValue]
	#[ORM\Column]
	public readonly int $id;

	#[Groups("tea:list")]
	#[ORM\Column]
	public TeaFamily $family;

	#[Groups("tea:list")]
	#[ORM\ManyToOne(inversedBy: 'teas')]
	#[ORM\JoinColumn]
	public ?TeaType $type = null;

	#[Ignore]
	#[ORM\ManyToOne(inversedBy: 'teas')]
	public ?Cultivar $cultivar = null;

	#[Groups("tea:list")]
	#[ORM\ManyToOne(inversedBy: 'teas')]
	public ?Origin $origin = null;

	#[ORM\ManyToOne(inversedBy: 'teas')]
	public ?User $user = null;

	/**
	 * @var Collection<int, Brewing>
	 */
	#[ORM\OneToMany(targetEntity: Brewing::class, mappedBy: 'tea')]
	#[Ignore]
	public Collection $brewings;

	#[ApiProperty(example: "Savage myst")]
	#[ORM\Column(type: Types::TEXT, nullable: true)]
	public ?string $name = null;

	#[Ignore]
	#[ORM\Column(nullable: true)]
	public ?bool $isBlend = null;

	#[Ignore]
	#[ORM\Column(type: "jsonb", nullable: true)]
	public ?array $harvest = null;

	#[Ignore]
	#[ORM\Column(nullable: true)]
	public ?RoastLevel $roast = null;

	#[ApiProperty(example: 2500)]
	#[Assert\GreaterThan(0)]
	#[ORM\Column(nullable: true)]
	public ?int $altitude = null;

    /**
     * @var Collection<int, Drink>
     */
    #[ORM\OneToMany(targetEntity: Drink::class, mappedBy: 'tea')]
    private Collection $drinks;

	public function __construct()
	{
		$this->brewings = new ArrayCollection();
        $this->drinks = new ArrayCollection();
	}

	public function setCultivar(?Cultivar $cultivar): static
	{
		$this->cultivar = $cultivar;

		// Not a blend if the cultivar is defined
		if (null !== $cultivar) {
			$this->isBlend = false;
		}

		return $this;
	}

	public function addBrewing(Brewing $brewing): static
	{
		if (!$this->brewings->contains($brewing)) {
			$this->brewings->add($brewing);
			$brewing->setTea($this);
		}

		return $this;
	}

	public function removeBrewing(Brewing $brewing): static
	{
		if ($this->brewings->removeElement($brewing)) {
			// set the owning side to null (unless already changed)
			if ($brewing->getTea() === $this) {
				$brewing->setTea(null);
			}
		}

		return $this;
	}

    /**
     * @return Collection<int, Drink>
     */
    public function getDrinks(): Collection
    {
        return $this->drinks;
    }

    public function addDrink(Drink $drink): static
    {
        if (!$this->drinks->contains($drink)) {
            $this->drinks->add($drink);
            $drink->setTea($this);
        }

        return $this;
    }

    public function removeDrink(Drink $drink): static
    {
        if ($this->drinks->removeElement($drink)) {
            // set the owning side to null (unless already changed)
            if ($drink->getTea() === $this) {
                $drink->setTea(null);
            }
        }

        return $this;
    }
}
