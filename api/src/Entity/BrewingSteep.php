<?php

namespace App\Entity;

use App\Repository\BrewingSteepRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: BrewingSteepRepository::class)]
class BrewingSteep
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    public readonly int $id;

    #[ORM\ManyToOne(inversedBy: 'steeps')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Brewing $brewing = null;

    #[ORM\Column]
    private int $duration;

    #[ORM\Column]
    private int $temperature;

    #[ORM\Column(nullable: true)]
    private ?int $waterVolume = null;

    public function getBrewing(): ?Brewing
    {
        return $this->brewing;
    }

    public function setBrewing(?Brewing $brewing): static
    {
        $this->brewing = $brewing;

        return $this;
    }

    public function getDuration(): ?int
    {
        return $this->duration;
    }

    public function setDuration(int $duration): static
    {
        $this->duration = $duration;

        return $this;
    }

    public function getTemperature(): ?int
    {
        return $this->temperature;
    }

    public function setTemperature(int $temperature): static
    {
        $this->temperature = $temperature;

        return $this;
    }

    public function getWaterVolume(): ?int
    {
        return $this->waterVolume;
    }

    public function setWaterVolume(?int $waterVolume): static
    {
        $this->waterVolume = $waterVolume;

        return $this;
    }
}
