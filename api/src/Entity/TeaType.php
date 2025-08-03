<?php

namespace App\Entity;

use App\Enum\TeaFamily;
use App\Repository\TeaTypeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TeaTypeRepository::class)]
class TeaType
{
	#[ORM\Id]
	#[ORM\GeneratedValue]
	#[ORM\Column]
	public ?int $id = null;

	#[ORM\Column(enumType: TeaFamily::class)]
	public TeaFamily $family;

	#[ORM\Column(type: Types::TEXT)]
	public string $name;

	/**
	 * @var Collection<int, Tea>
	 */
	#[ORM\OneToMany(targetEntity: Tea::class, mappedBy: 'type')]
	private Collection $teas;

	#[ORM\ManyToOne(targetEntity: Origin::class, inversedBy: 'types')]
	public ?Origin $origin = null;

	/**
	 * @var bool Protected appellation (Protected Designation of Origin)
	 * @see https://en.wikipedia.org/wiki/Protected_designation_of_origin
	 */
	#[ORM\Column(options: ["default" => false])]
	public bool $isProtectedOrigin = false;

	#[ORM\ManyToOne(targetEntity: User::class)]
	#[ORM\JoinColumn("created_by")]
	public ?User $createdBy = null;

	#[ORM\Column(type: Types::DATETIME_IMMUTABLE, options: ["default" => "NOW()"])]
	public \DateTimeImmutable $createdAt;

	public function __construct()
	{
		$this->teas = new ArrayCollection();
		$this->createdAt = new \DateTimeImmutable();
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
