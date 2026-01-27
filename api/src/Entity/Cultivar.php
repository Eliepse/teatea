<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Doctrine\ORM\TimestampedEntity;
use App\Repository\CultivarRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CultivarRepository::class)]
class Cultivar
{
	use TimestampedEntity;

	#[ORM\Id]
	#[ORM\GeneratedValue]
	#[ORM\Column]
	private(set) int $id;

	#[ORM\Column(type: Types::TEXT)]
	public string $name;

	#[ORM\ManyToOne(targetEntity: User::class)]
	public ?User $author = null;

	/**
	 * @var Collection<int, Tea>
	 */
	#[ORM\OneToMany(targetEntity: Tea::class, mappedBy: "cultivar")]
	private Collection $teas;

	public function __construct()
	{
		$this->teas = new ArrayCollection();
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
			//            if ($tea->getCultivar() === $this) {
			//                $tea->setCultivar(null);
			//            }
		}

		return $this;
	}
}
