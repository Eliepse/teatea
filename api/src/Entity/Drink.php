<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\DrinkRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DrinkRepository::class)]
#[ApiResource]
class Drink
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $drankAt = null;

    #[ORM\ManyToOne(inversedBy: 'drinks')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Tea $tea = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDrankAt(): ?\DateTimeImmutable
    {
        return $this->drankAt;
    }

    public function setDrankAt(\DateTimeImmutable $drankAt): static
    {
        $this->drankAt = $drankAt;

        return $this;
    }

    public function getTea(): ?Tea
    {
        return $this->tea;
    }

    public function setTea(?Tea $tea): static
    {
        $this->tea = $tea;

        return $this;
    }
}
