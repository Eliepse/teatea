<?php

namespace App\Entity;

use App\Doctrine\ORM\TimestampedEntity;
use App\Enum\TeaListPivotType;
use App\Repository\TeaListRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\String\UnicodeString;
use Symfony\Component\Validator\Constraints\Unique;

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

	public function __construct()
	{
		$this->slug = bin2hex(random_bytes(12));
	}
}
