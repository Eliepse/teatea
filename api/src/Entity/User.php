<?php

namespace App\Entity;

use App\Doctrine\ORM\TimestampedEntity;
use App\Entity\Pivot\FriendshipRequest;
use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use MartinGeorgiev\Doctrine\DBAL\Type;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: "`user`")]
#[ORM\UniqueConstraint(name: "UNIQ_IDENTIFIER_EMAIL", fields: ["email"])]
#[ORM\UniqueConstraint(name: "UNIQ_IDENTIFIER_USERNAME", fields: ["username"])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
	use TimestampedEntity;

	#[ORM\Id]
	#[ORM\GeneratedValue]
	#[ORM\Column]
	public ?int $id = null;

	#[Assert\Email]
	#[Assert\Unique]
	#[ORM\Column(type: Types::TEXT)]
	public string $email;

	#[Assert\Length(min: 2)]
	#[Assert\Unique]
	#[ORM\Column(type: Types::TEXT, nullable: true)]
	public ?string $username = null;

	/** @var list<string> The user roles */
	#[ORM\Column(type: Type::JSONB)]
	private array $roles = [];

	/** @var ?string The hashed password */
	#[ORM\Column(type: Types::TEXT, nullable: true)]
	private ?string $password = null;

	/**
	 * @var Collection<int, TeaSession>
	 */
	#[ORM\OneToMany(targetEntity: TeaSession::class, mappedBy: "author")]
	private Collection $sessions;

	/**
	 * @var Collection<int, TeaList>
	 */
	#[ORM\OneToMany(targetEntity: TeaList::class, mappedBy: "owner", orphanRemoval: true)]
	private Collection $teaLists;

	/**
	 * @var Collection<int, CollectionTea>
	 */
	#[ORM\OneToMany(targetEntity: CollectionTea::class, mappedBy: "owner", orphanRemoval: true)]
	private Collection $collectionTeas;

	#[ORM\ManyToOne]
	private ?User $referrer = null;

	#[ORM\OneToMany(targetEntity: FriendshipRequest::class, mappedBy: "requestedBy")]
	private Collection $friendRequestsSent;

	#[ORM\OneToMany(targetEntity: FriendshipRequest::class, mappedBy: "target")]
	private Collection $friendRequestsReceived;

	public function __construct()
	{
		$this->teaLists = new ArrayCollection();
		$this->collectionTeas = new ArrayCollection();
	}

	/**
	 * A visual identifier that represents this user.
	 *
	 * @see UserInterface
	 */
	public function getUserIdentifier(): string
	{
		return $this->email;
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
	#[\Deprecated]
	public function eraseCredentials(): void
	{
	}
}
