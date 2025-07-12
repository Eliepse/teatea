<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiProperty;
use App\Enum\RoastLevel;
use App\Enum\TeaFamily;
use App\Repository\TeaRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: TeaRepository::class)]
//#[ApiResource(normalizationContext: ["groups" => ["tea:list"]], security: "is_granted('ROLE_USER')")]
class Tea
{
	#[ORM\Id]
	#[ORM\GeneratedValue]
	#[ORM\Column]
	public readonly int $id;

	#[ORM\Column]
	public TeaFamily $family;

	#[ORM\ManyToOne(inversedBy: 'teas')]
	#[ORM\JoinColumn]
	public ?TeaType $type = null;

	#[ORM\ManyToOne(inversedBy: 'teas')]
	public ?Cultivar $cultivar = null;

	#[ORM\ManyToOne(inversedBy: 'teas')]
	public ?Origin $origin = null;

	/**
	 * @var Collection<int, Brewing>
	 */
	#[ORM\OneToMany(targetEntity: Brewing::class, mappedBy: 'tea')]
	public Collection $brewings;

	#[ApiProperty(example: "Savage myst")]
	#[ORM\Column(type: Types::TEXT, nullable: true)]
	public ?string $name = null;

	#[ORM\Column(nullable: true)]
	public ?bool $isBlend = null;

	#[ORM\Column(type: "jsonb", nullable: true)]
	public ?array $harvest = null;

	#[ORM\Column(nullable: true)]
	public ?RoastLevel $roast = null;

	#[Assert\GreaterThan(0)]
	#[ORM\Column(nullable: true)]
	public ?int $altitude = null;

	/**
	 * @var Collection<int, Drink>
	 */
	#[ORM\OneToMany(targetEntity: Drink::class, mappedBy: 'tea')]
	private Collection $drinks;

    /**
     * @var Collection<int, TeaList>
     */
    #[ORM\ManyToMany(targetEntity: TeaList::class, mappedBy: 'teas')]
    private Collection $lists;

	public function __construct(
		#[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
		public readonly \DateTimeImmutable $createdAt = new \DateTimeImmutable(),
	)
	{
		$this->brewings = new ArrayCollection();
		$this->drinks = new ArrayCollection();
        $this->lists = new ArrayCollection();
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

//	public function addBrewing(Brewing $brewing): static
//	{
//		if (!$this->brewings->contains($brewing)) {
//			$this->brewings->add($brewing);
//			$brewing->setTea($this);
//		}
//
//		return $this;
//	}
//
//	public function removeBrewing(Brewing $brewing): static
//	{
//		if ($this->brewings->removeElement($brewing)) {
//			// set the owning side to null (unless already changed)
//			if ($brewing->getTea() === $this) {
//				$brewing->setTea(null);
//			}
//		}
//
//		return $this;
//	}

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

    /**
     * @return Collection<int, TeaList>
     */
    public function getLists(): Collection
    {
        return $this->lists;
    }

    public function addList(TeaList $list): static
    {
        if (!$this->lists->contains($list)) {
            $this->lists->add($list);
            $list->addTea($this);
        }

        return $this;
    }

    public function removeList(TeaList $list): static
    {
        if ($this->lists->removeElement($list)) {
            $list->removeTea($this);
        }

        return $this;
    }
}
