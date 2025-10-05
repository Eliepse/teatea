<?php

namespace App\Entity;

use App\Doctrine\ORM\TimestampedEntity;
use App\Repository\TeaListPivotRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TeaListPivotRepository::class)]
class TeaListPivot
{
	use TimestampedEntity;

	#[ORM\Id]
	#[ORM\GeneratedValue]
	#[ORM\Column]
	public readonly int $id;

	#[ORM\ManyToOne]
	#[ORM\JoinColumn(nullable: false)]
	public Tea $tea;

	#[ORM\ManyToOne]
	#[ORM\JoinColumn(nullable: false)]
	public TeaList $list;
}
