<?php

namespace App\Entity;

use App\Repository\TokenRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: TokenRepository::class)]
class Token
{
	// Passwordless sign-in
	const string TYPE_OTP = "otp";

	#[ORM\Id]
	#[ORM\GeneratedValue]
	#[ORM\Column]
	private(set) ?int $id = null;

	#[ORM\Column]
	public readonly \DateTimeImmutable $createdAt;

	public function __construct(
		#[ORM\ManyToOne]
		#[ORM\JoinColumn(nullable: false)]
		public readonly ?User $owner = null,

		#[Assert\Unique]
		#[ORM\Column(type: Types::TEXT, nullable: false)]
		public readonly string $tokenKey,

		#[ORM\Column(type: Types::TEXT)]
		public readonly ?string $signature = null,

		#[ORM\Column(nullable: true)]
		public readonly ?\DateTimeImmutable $expiredAt = null,
	)
	{
		$this->createdAt = new \DateTimeImmutable();
	}

	public function isExpired(): bool
	{
		if (null === $this->expiredAt) {
			return false;
		}

		return $this->expiredAt <= new \DateTimeImmutable();
	}
}
