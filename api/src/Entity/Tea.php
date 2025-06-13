<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\TeaRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use App\Enum\RoastLevel;
use App\Enum\TeaFamily;

#[ORM\Entity(repositoryClass: TeaRepository::class)]
#[ApiResource]
class Tea
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'teas')]
    #[ORM\JoinColumn(nullable: false)]
    private ?TeaType $type = null;

    #[ORM\ManyToOne(inversedBy: 'teas')]
    private ?Cultivar $cultivar = null;

    #[ORM\ManyToOne(inversedBy: 'teas')]
    private ?Origin $origin = null;

    /**
     * @var Collection<int, Brewing>
     */
    #[ORM\OneToMany(targetEntity: Brewing::class, mappedBy: 'tea')]
    private Collection $brewings;

    public function __construct(#[ORM\Column]
    private TeaFamily $family, #[ORM\Column(nullable: true)]
    private ?string $name = null, #[ORM\Column(nullable: true)]
    private ?bool $isBlend = null, #[ORM\Column(nullable: true, type: "jsonb")]
    private ?array $harvest = null, #[ORM\Column(nullable: true)]
    private ?RoastLevel $roast = null, #[ORM\Column(nullable: true)]
    private ?int $altitude = null)
    {
        $this->brewings = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function isBlend(): ?bool
    {
        return $this->isBlend;
    }

    public function setIsBlend(?bool $isBlend): static
    {
        $this->isBlend = $isBlend;

        return $this;
    }

    public function getHarvest(): ?array
    {
        return $this->harvest;
    }

    public function setHarvest(?array $harvest): static
    {
        $this->harvest = $harvest;

        return $this;
    }

    public function getRoast(): ?int
    {
        return $this->roast;
    }

    public function setRoast(?int $roast): static
    {
        $this->roast = $roast;

        return $this;
    }

    public function getAltitude(): ?int
    {
        return $this->altitude;
    }

    public function setAltitude(?int $altitude): static
    {
        $this->altitude = $altitude;

        return $this;
    }

    public function getType(): ?TeaType
    {
        return $this->type;
    }

    public function setType(?TeaType $type): static
    {
        $this->type = $type;

        return $this;
    }

    public function getCultivar(): ?Cultivar
    {
        return $this->cultivar;
    }

    public function setCultivar(?Cultivar $cultivar): static
    {
        $this->cultivar = $cultivar;

        return $this;
    }

    public function getOrigin(): ?Origin
    {
        return $this->origin;
    }

    public function setOrigin(?Origin $origin): static
    {
        $this->origin = $origin;

        return $this;
    }

    /**
     * @return Collection<int, Brewing>
     */
    public function getBrewings(): Collection
    {
        return $this->brewings;
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
}
