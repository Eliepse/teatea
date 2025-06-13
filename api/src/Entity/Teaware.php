<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\TeawareRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use App\Enum\TeawareType;

#[ORM\Entity(repositoryClass: TeawareRepository::class)]
#[ApiResource]
class Teaware
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(enumType: TeawareType::class)]
    private ?TeawareType $type = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(nullable: true)]
    private ?int $volume = null;

    /**
     * @var Collection<int, Brewing>
     */
    #[ORM\OneToMany(targetEntity: Brewing::class, mappedBy: 'teaware')]
    private Collection $brewings;

    public function __construct()
    {
        $this->brewings = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getType(): ?TeawareType
    {
        return $this->type;
    }

    public function setType(TeawareType $type): static
    {
        $this->type = $type;

        return $this;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getVolume(): ?int
    {
        return $this->volume;
    }

    public function setVolume(?int $volume): static
    {
        $this->volume = $volume;

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
            $brewing->setTeaware($this);
        }

        return $this;
    }

    public function removeBrewing(Brewing $brewing): static
    {
        if ($this->brewings->removeElement($brewing)) {
            // set the owning side to null (unless already changed)
            if ($brewing->getTeaware() === $this) {
                $brewing->setTeaware(null);
            }
        }

        return $this;
    }
}
