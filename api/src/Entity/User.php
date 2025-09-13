<?php

namespace App\Entity;

use App\Repository\UserRepository;
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

	#[Assert\Length(min: 2)]
	#[Assert\Unique]
	#[ORM\Column(type: Types::TEXT, nullable: true)]
	public ?string $username = null;

	/** @var list<string> The user roles */
	#[ORM\Column]
	private array $roles = [];

	/** @var ?string The hashed password */
	#[ORM\Column(type: Types::TEXT, nullable: true)]
	private ?string $password = null;

	/**
	 * @var Collection<int, TeaSession>
	 */
	#[ORM\OneToMany(targetEntity: TeaSession::class, mappedBy: 'author')]
	private Collection $sessions;

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
		return array_unique($this->roles);
	}

	public function hasRole(string $role): bool
	{
		return in_array($role, $this->roles, true);
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
