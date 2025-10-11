<?php

namespace App\Entity;

use App\Doctrine\ORM\TimestampedEntity;
use App\Enum\TeaListPivotType;
use App\Repository\TeaListPivotRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TeaListPivotRepository::class)]
class TeaListPivot
{
	use TimestampedEntity;

	#[ORM\Id]
	#[ORM\GeneratedValue]
	#[ORM\Column]
	public int $id;

	#[ORM\ManyToOne]
	#[ORM\JoinColumn(nullable: false)]
	public Tea $tea;

	#[ORM\ManyToOne]
	#[ORM\JoinColumn(nullable: true)]
	public ?TeaList $list = null;

	#[ORM\Column]
	public TeaListPivotType $type = TeaListPivotType::Custom;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    public User $author;
}
