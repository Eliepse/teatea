<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\CultivarRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CultivarRepository::class)]
#[ApiResource]
class Cultivar
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    /**
     * @var Collection<int, Tea>
     */
    #[ORM\OneToMany(targetEntity: Tea::class, mappedBy: 'cultivar')]
    private Collection $teas;

    public function __construct()
    {
        $this->teas = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    /**
     * @return Collection<int, Tea>
     */
    public function getTeas(): Collection
    {
        return $this->teas;
    }

    public function addTea(Tea $tea): static
    {
        if (!$this->teas->contains($tea)) {
            $this->teas->add($tea);
            $tea->setCultivar($this);
        }

        return $this;
    }

    public function removeTea(Tea $tea): static
    {
        if ($this->teas->removeElement($tea)) {
            // set the owning side to null (unless already changed)
            if ($tea->getCultivar() === $this) {
                $tea->setCultivar(null);
            }
        }

        return $this;
    }
}
