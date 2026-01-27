<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Enum\TeawareType;
use App\Repository\TeawareRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TeawareRepository::class)]
#[ApiResource]
class Teaware
{
	#[ORM\Id]
	#[ORM\GeneratedValue]
	#[ORM\Column]
	private int $id;

	#[ORM\Column(enumType: TeawareType::class)]
	private TeawareType $type;

	#[ORM\Column]
	private string $name;

	#[ORM\Column(nullable: true)]
	private ?int $volume = null;

	public function __construct() {}

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
}
