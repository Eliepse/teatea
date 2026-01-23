<?php

namespace App\Entity;

use App\Doctrine\DBAL\Types\ValueObject\LTreePath;
use App\Doctrine\ORM\TimestampedEntity;
use App\Repository\OriginRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: OriginRepository::class)]
#[ORM\Index("path_gist_idx", fields: ["path"])]
class Origin
{
	use TimestampedEntity;

	#[ORM\Id]
	#[ORM\Column(type: "ltree", unique: true)]
	public LTreePath $path;

	#[ORM\Column(type: Types::TEXT)]
	public string $name;

	#[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
	public ?\DateTimeImmutable $validatedAt = null;

	/**
	 * @var Collection<int, Tea>
	 */
	#[ORM\OneToMany(targetEntity: Tea::class, mappedBy: 'origin')]
	private Collection $teas;

	#[ORM\ManyToOne]
	#[ORM\JoinColumn(onDelete: "SET NULL")]
	public ?User $author = null;

	/**
	 * @var string[]
	 */
	public array $namePath = [];

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

	public function isCountry(): bool
	{
		return 1 === count($this->path->getNodes());
	}

	public function isRegion(): bool
	{
		return 2 === count($this->path->getNodes());
	}

	public function isLocality(): bool
	{
		return 3 === count($this->path->getNodes());
	}
}
