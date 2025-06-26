<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_USERNAME', fields: ['username'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
	#[ORM\Id]
	#[ORM\GeneratedValue]
	#[ORM\Column]
	public readonly int $id;

	#[Assert\Email]
	#[Assert\Unique]
	#[ORM\Column(type: Types::TEXT)]
	public string $email;

	#[Assert\NotBlank]
	#[Assert\Length(min: 2)]
	#[Assert\Unique]
	#[ORM\Column(type: Types::TEXT)]
	private ?string $username = null;

	/** @var list<string> The user roles */
	#[ORM\Column]
	private array $roles = [];

	/** @var ?string The hashed password */
	#[ORM\Column]
	private ?string $password = null;

	/** @var Collection<int, Tea> */
	#[ORM\OneToMany(targetEntity: Tea::class, mappedBy: "user")]
	public Collection $teas;

	/** @var Collection<int, Brewing> */
	#[ORM\OneToMany(targetEntity: Brewing::class, mappedBy: "brewings")]
	public Collection $brewings;

	public function __construct()
	{
		$this->teas = new ArrayCollection();
		$this->brewings = new ArrayCollection();
	}

	/**
	 * A visual identifier that represents this user.
	 *
	 * @see UserInterface
	 */
	public function getUserIdentifier(): string
	{
		return (string)$this->email;
	}

	/**
	 * @return list<string>
	 * @see UserInterface
	 *
	 */
	public function getRoles(): array
	{
		$roles = $this->roles;
		// guarantee every user at least has ROLE_USER
		$roles[] = 'ROLE_USER';

		return array_unique($roles);
	}

	/**
	 * @param list<string> $roles
	 */
	public function setRoles(array $roles): static
	{
		$this->roles = $roles;

		return $this;
	}

	/**
	 * @see PasswordAuthenticatedUserInterface
	 */
	public function getPassword(): ?string
	{
		return $this->password;
	}

	public function setPassword(string $password): static
	{
		$this->password = $password;

		return $this;
	}

	/**
	 * @see UserInterface
	 */
	public function eraseCredentials(): void
	{
		// If you store any temporary, sensitive data on the user, clear it here
		// $this->plainPassword = null;
	}
}
