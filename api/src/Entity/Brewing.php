<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\BrewingRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: BrewingRepository::class)]
#[ApiResource]
class Brewing
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'brewings')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Tea $tea = null;

    #[ORM\Column(nullable: true)]
    private ?int $teaQuantity = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\ManyToOne(inversedBy: 'brewings')]
    private ?Teaware $teaware = null;

    public function getId(): ?int
    {
        return $this->id;
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

    public function getTeaQuantity(): ?int
    {
        return $this->teaQuantity;
    }

    public function setTeaQuantity(?int $teaQuantity): static
    {
        $this->teaQuantity = $teaQuantity;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getTeaware(): ?Teaware
    {
        return $this->teaware;
    }

    public function setTeaware(?Teaware $teaware): static
    {
        $this->teaware = $teaware;

        return $this;
    }
}
