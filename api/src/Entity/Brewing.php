<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\BrewingRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: BrewingRepository::class)]
#[ApiResource]
class Brewing
{
	#[ORM\Id]
	#[ORM\GeneratedValue]
	#[ORM\Column]
	public readonly int $id;

	#[ORM\ManyToOne(inversedBy: 'brewings')]
	#[ORM\JoinColumn]
	public Tea $tea;

	#[ORM\ManyToOne(inversedBy: 'brewings')]
	#[ORM\JoinColumn]
	public User $user;

	#[ORM\Column]
	public ?int $teaQuantity = null;

	#[ORM\ManyToOne(inversedBy: 'brewings')]
	public ?Teaware $teaware = null;

	#[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
	public \DateTimeInterface $brewedAt;

	#[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
	public \DateTimeInterface $createdAt;

	/**
	 * @var Collection<int, BrewingSteep>
	 */
	#[ORM\OneToMany(targetEntity: BrewingSteep::class, mappedBy: 'brewing', orphanRemoval: true)]
	private Collection $steeps;

	public function __construct()
	{
		$this->steeps = new ArrayCollection();
		$this->brewedAt = new \DateTimeImmutable();
		$this->createdAt = new \DateTimeImmutable();
	}

	/**
	 * @return Collection<int, BrewingSteep>
	 */
	public function getSteeps(): Collection
	{
		return $this->steeps;
	}

	public function addSteep(BrewingSteep $duration): static
	{
		if (!$this->steeps->contains($duration)) {
			$this->steeps->add($duration);
			$duration->setBrewing($this);
		}

		return $this;
	}

	public function removeSteep(BrewingSteep $duration): static
	{
		if ($this->steeps->removeElement($duration)) {
			// set the owning side to null (unless already changed)
			if ($duration->getBrewing() === $this) {
				$duration->setBrewing(null);
			}
		}

		return $this;
	}
}
