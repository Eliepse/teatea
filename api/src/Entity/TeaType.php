<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Enum\TeaFamily;
use App\Repository\TeaTypeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TeaTypeRepository::class)]
#[ApiResource]
class TeaType
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(enumType: TeaFamily::class)]
    public TeaFamily $family;

    #[ORM\Column(type: Types::TEXT)]
    public string $name;

    /**
     * @var Collection<int, Tea>
     */
    #[ORM\OneToMany(targetEntity: Tea::class, mappedBy: 'type')]
    private Collection $teas;

    public function __construct()
    {
        $this->teas = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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
            $tea->setType($this);
        }

        return $this;
    }

    public function removeTea(Tea $tea): static
    {
        if ($this->teas->removeElement($tea)) {
            // set the owning side to null (unless already changed)
            if ($tea->getType() === $this) {
                $tea->setType(null);
            }
        }

        return $this;
    }
}
