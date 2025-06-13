<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\OriginRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: OriginRepository::class)]
#[ApiResource]
class Origin
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $path = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    /**
     * @var Collection<int, Tea>
     */
    #[ORM\OneToMany(targetEntity: Tea::class, mappedBy: 'origin')]
    private Collection $teas;

    public function __construct()
    {
        $this->teas = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPath(): ?string
    {
        return $this->path;
    }

    public function setPath(string $path): static
    {
        $this->path = $path;

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
            $tea->setOrigin($this);
        }

        return $this;
    }

    public function removeTea(Tea $tea): static
    {
        if ($this->teas->removeElement($tea)) {
            // set the owning side to null (unless already changed)
            if ($tea->getOrigin() === $this) {
                $tea->setOrigin(null);
            }
        }

        return $this;
    }
}
