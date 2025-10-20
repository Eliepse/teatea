<?php

namespace App\Entity;

use App\Doctrine\ORM\TimestampedEntity;
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
	public ?User $author = null;
}
