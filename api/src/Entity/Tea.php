<?php

namespace App\Entity;

use App\Doctrine\ORM\TimestampedEntity;
use App\Enum\RoastLevel;
use App\Enum\TeaFamily;
use App\Repository\TeaRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: TeaRepository::class)]
class Tea
{
	use TimestampedEntity;

	#[ORM\Id]
	#[ORM\GeneratedValue]
	#[ORM\Column]
	public readonly int $id;

	#[ORM\Column]
	public TeaFamily $family;

	#[ORM\Column(nullable: true)]
	public ?int $originId = null;

	#[ORM\ManyToOne(inversedBy: 'teas')]
	#[ORM\JoinColumn]
	public ?TeaType $type = null;

	#[ORM\ManyToOne(inversedBy: 'teas')]
	public ?Cultivar $cultivar = null;

	#[ORM\ManyToOne(inversedBy: 'teas')]
	#[ORM\JoinColumn("origin_id")]
	public ?Origin $origin = null;

	#[ORM\Column(nullable: true)]
	public ?bool $isBlend = null;

	#[ORM\Column(type: "jsonb", nullable: true)]
	public ?array $harvest = null;

	#[ORM\Column(nullable: true)]
	public ?RoastLevel $roast = null;

	#[Assert\GreaterThan(0)]
	#[ORM\Column(nullable: true)]
	public ?int $altitude = null;

	/**
	 * @var Collection<int, TeaSession>
	 */
	#[ORM\OneToMany(targetEntity: TeaSession::class, mappedBy: 'tea')]
	private Collection $sessions;

	#[ORM\ManyToOne]
	#[ORM\JoinColumn(nullable: false)]
	public ?User $createdBy = null;

	public function __construct()
	{
		$this->sessions = new ArrayCollection();
	}

	public function setCultivar(?Cultivar $cultivar): static
	{
		$this->cultivar = $cultivar;

		// Not a blend if the cultivar is defined
		if (null !== $cultivar) {
			$this->isBlend = false;
		}

		return $this;
	}

	/**
	 * @return Collection<int, TeaSession>
	 */
	public function getSessions(): Collection
	{
		return $this->sessions;
	}

	public function addSession(TeaSession $session): static
	{
		if (!$this->sessions->contains($session)) {
			$this->sessions->add($session);
//			$session->setTea($this);
		}

		return $this;
	}

	public function removeSession(TeaSession $session): static
	{
//		if ($this->sessions->removeElement($session)) {
		// set the owning side to null (unless already changed)
//			if ($session->getTea() === $this) {
//				$session->setTea(null);
//			}
//		}

		return $this;
	}
}
