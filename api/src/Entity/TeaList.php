<?php

namespace App\Entity;

use App\Repository\TeaListRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TeaListRepository::class)]
class TeaList
{
	#[ORM\Id]
	#[ORM\GeneratedValue]
	#[ORM\Column]
	public readonly int $id;

	#[ORM\Column(type: Types::TEXT)]
	public ?string $name = null;

	/**
	 * @var Collection<int, Tea>
	 */
	#[ORM\ManyToMany(targetEntity: Tea::class, inversedBy: 'lists')]
	public Collection $teas;

	#[ORM\ManyToOne(inversedBy: 'teaLists')]
	#[ORM\JoinColumn(nullable: false)]
	public User $owner;

	public function __construct()
	{
		$this->teas = new ArrayCollection();
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
		$this->teas->removeElement($tea);

		return $this;
	}
}
