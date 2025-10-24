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

	// Used to activate an inactive OTP token
	const string TYPE_OTP_CHALLENGE = "otp_challenge";

	#[ORM\Id]
	#[ORM\GeneratedValue]
	#[ORM\Column]
	private(set) ?int $id = null;

	#[ORM\Column]
	public readonly \DateTimeImmutable $createdAt;

	#[ORM\ManyToOne(cascade: ["ALL"])]
	#[ORM\JoinColumn(nullable: true, onDelete: "CASCADE")]
	public ?Token $challengeFor = null;

	public function __construct(
		#[Assert\Unique]
		#[ORM\Column(type: Types::TEXT, nullable: false)]
		public readonly string $tokenKey,

		#[ORM\ManyToOne]
		#[ORM\JoinColumn(nullable: false)]
		public readonly User $owner,

		#[ORM\Column(type: Types::TEXT)]
		public readonly ?string $signature = null,

		// Define when the validity of the token will start
		#[ORM\Column(nullable: true)]
		public ?\DateTimeImmutable $validFrom = null,

		#[ORM\Column(nullable: true)]
		public readonly ?\DateTimeImmutable $expiredAt = null,
	) {
		$this->createdAt = new \DateTimeImmutable();

		if ($this->expiredAt && $this->validFrom && $this->expiredAt <= $this->validFrom) {
			throw new \RuntimeException("Inverted expiration and validity dates");
		}
	}

	public function isExpired(): bool
	{
		if (null === $this->expiredAt) {
			return false;
		}

		return $this->expiredAt <= new \DateTimeImmutable();
	}

	public function isValid(): bool
	{
		if (null === $this->validFrom) {
			return false;
		}

		return false === $this->isExpired() && $this->validFrom <= new \DateTimeImmutable();
	}
}
