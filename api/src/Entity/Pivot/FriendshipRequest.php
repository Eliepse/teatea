<?php

namespace App\Entity\Pivot;

use App\Doctrine\ORM\TimestampedEntity;
use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table]
#[ORM\UniqueConstraint(fields: ["requestedBy", "target"])]
class FriendshipRequest
{
	use TimestampedEntity;

	#[ORM\Id]
	#[ORM\GeneratedValue]
	#[ORM\Column]
	public ?int $id = null;

	#[ORM\ManyToOne(targetEntity: User::class, inversedBy: "friendRequestsSent")]
	#[ORM\JoinColumn(nullable: false)]
	private User $requestedBy;

	#[ORM\ManyToOne(targetEntity: User::class, inversedBy: "friendRequestsReceived")]
	#[ORM\JoinColumn(nullable: false)]
	private User $target;

	#[ORM\Column(nullable: true)]
	private ?\DateTimeImmutable $requestedAt = null;

	#[ORM\Column(nullable: true)]
	private ?\DateTimeImmutable $acceptedAt = null;

	#[ORM\Column(nullable: true)]
	private ?\DateTimeImmutable $rejectedAt = null;
}
