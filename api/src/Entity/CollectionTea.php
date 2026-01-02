<?php

namespace App\Entity;

use App\Doctrine\HasMedia;
use App\Doctrine\ORM\TimestampedEntity;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class CollectionTea implements HasMedia
{
	use TimestampedEntity;

	#[ORM\Id]
	#[ORM\GeneratedValue]
	#[ORM\Column]
	public int $id;

	#[ORM\ManyToOne(inversedBy: "collectionTeas")]
	#[ORM\JoinColumn(nullable: false, onDelete: "CASCADE")]
	public User $owner;

	#[ORM\ManyToOne(inversedBy: "collectionTeas")]
	#[ORM\JoinColumn(nullable: false)]
	public Tea $tea;

	#[ORM\Column(type: Types::TEXT, nullable: true)]
	public ?string $description = null;

	#[ORM\Column(type: Types::DATE_IMMUTABLE, nullable: true)]
	public ?\DateTimeImmutable $acquiredAt = null;

	#[ORM\ManyToOne(inversedBy: "collectionTeas")]
	#[ORM\JoinColumn(nullable: true, onDelete: "SET NULL")]
	public ?Business $acquiredFrom = null;

//	TODO(elie): allow custom collections
//	public ?UserCollection $collection = null;

	// Requires manual hydration
	public Collection $media;

	public function __construct()
	{
		$this->media = new ArrayCollection();
	}

	public function getType(): string
	{
		return CollectionTea::class;
	}

	public function getId(): int
	{
		return $this->id;
	}
}
