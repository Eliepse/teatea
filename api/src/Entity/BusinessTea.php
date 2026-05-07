<?php

namespace App\Entity;

use App\Doctrine\ORM\TimestampedEntity;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class BusinessTea
{
	use TimestampedEntity;

	#[ORM\Id]
	#[ORM\GeneratedValue]
	#[ORM\Column]
	private(set) int $id;

	#[ORM\ManyToOne(targetEntity: Tea::class, inversedBy: "businessTeas")]
	#[ORM\JoinColumn(nullable: false)]
	public Tea $tea;

	#[ORM\ManyToOne(targetEntity: Business::class, inversedBy: "teas")]
	#[ORM\JoinColumn(nullable: false)]
	public Business $business;
}
