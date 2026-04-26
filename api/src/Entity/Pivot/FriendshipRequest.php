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
	public User $requestedBy;

	#[ORM\ManyToOne(targetEntity: User::class, inversedBy: "friendRequestsReceived")]
	#[ORM\JoinColumn(nullable: false)]
	public User $target;

	#[ORM\Column(nullable: true)]
	private(set) ?\DateTimeImmutable $requestedAt = null;

	#[ORM\Column(nullable: true)]
	private(set) ?\DateTimeImmutable $acceptedAt = null;

	#[ORM\Column(nullable: true)]
	private(set) ?\DateTimeImmutable $rejectedAt = null;

	public function __construct(User $requestor, User $target)
	{
		$this->requestedBy = $requestor;
		$this->requestedAt = new \DateTimeImmutable();
		$this->target = $target;
	}

	public function decided(): bool
	{
		return null === $this->requestedAt || $this->acceptedAt || $this->rejectedAt;
	}

	public function accepted(): bool
	{
		return null !== $this->acceptedAt;
	}

	public function ignored(): bool
	{
		return null === $this->requestedAt;
	}

	public function rejected(): bool
	{
		return null !== $this->rejectedAt;
	}

	public function accept(): void
	{
		$this->acceptedAt = new \DateTimeImmutable();
		$this->rejectedAt = null;
	}

	public function reject(): void
	{
		$this->acceptedAt = null;
		$this->rejectedAt = new \DateTimeImmutable();
	}

	public function ignore(): void
	{
		$this->requestedAt = null;
		$this->acceptedAt = null;
		$this->rejectedAt = null;
	}

	public function friendshippedAt(): ?\DateTimeImmutable
	{
		return $this->accepted() ? $this->acceptedAt : null;
	}
}
