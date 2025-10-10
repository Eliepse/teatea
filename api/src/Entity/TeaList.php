<?php

namespace App\Entity;

use App\Doctrine\ORM\TimestampedEntity;
use App\Repository\TeaListRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TeaListRepository::class)]
class TeaList
{
	use TimestampedEntity;

	#[ORM\Id]
	#[ORM\GeneratedValue]
	#[ORM\Column]
	public int $id;

	#[ORM\Column(type: Types::TEXT, unique: true)]
	public string $slug;

	#[ORM\Column(type: Types::TEXT, nullable: true)]
	public ?string $name = null;

	#[ORM\ManyToOne(inversedBy: 'teaLists')]
	#[ORM\JoinColumn(nullable: false)]
	public User $owner;

	#[ORM\OneToMany(targetEntity: TeaListPivot::class, mappedBy: "list")]
	public Collection $teaListPivots;

	public function __construct()
	{
		$this->slug = bin2hex(random_bytes(12));
		$this->teaListPivots = new ArrayCollection();
	}
}
