<?php

namespace App\Entity;

use App\Doctrine\ORM\TimestampedEntity;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Business
{
	use TimestampedEntity;

	#[ORM\Id]
	#[ORM\GeneratedValue]
	#[ORM\Column]
	public int $id;

	#[ORM\Column(type: Types::TEXT, nullable: false)]
	public string $name;

	#[ORM\ManyToOne]
	#[ORM\JoinColumn(nullable: false)]
	public User $author;

	/**
	 * @var Collection<int, CollectionTea>
	 */
	#[ORM\OneToMany(targetEntity: CollectionTea::class, mappedBy: "acquiredFrom")]
	private Collection $acquiredTeas;

	/**
	 * @var Collection<int, Tea>
	 */
	#[ORM\OneToMany(targetEntity: Tea::class, mappedBy: "business")]
	private Collection $teas;

	public function __construct()
	{
		$this->acquiredTeas = new ArrayCollection();
		$this->teas = new ArrayCollection();
	}
}
