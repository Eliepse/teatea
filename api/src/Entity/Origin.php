<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiProperty;
use App\Doctrine\DBAL\Types\ValueObject\LTreePath;
use App\Repository\OriginRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Ignore;

#[ORM\Entity(repositoryClass: OriginRepository::class)]
class Origin
{
	#[ORM\Id]
	#[ORM\GeneratedValue]
	#[ORM\Column]
	public readonly int $id;

	#[ORM\Column(type: "ltree")]
	#[ApiProperty(genId: false)]
	public LTreePath $path;

	#[ORM\Column(type: Types::TEXT)]
	public string $name;

	/**
	 * @var Collection<int, Tea>
	 */
	#[Ignore]
	#[ORM\OneToMany(targetEntity: Tea::class, mappedBy: 'origin')]
	private Collection $teas;

	/**
	 * @var Collection<int, TeaType>
	 */
	#[Ignore]
	#[ORM\OneToMany(targetEntity: TeaType::class, mappedBy: "origin")]
	private Collection $types;

	public function __construct()
	{
		$this->teas = new ArrayCollection();
		$this->types = new ArrayCollection();
	}

	/**
	 * @return Collection<int, Tea>
	 */
	#[Ignore]
	public function getTeas(): Collection
	{
		return $this->teas;
	}

	public function addTea(Tea $tea): static
	{
		if (!$this->teas->contains($tea)) {
			$this->teas->add($tea);
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
