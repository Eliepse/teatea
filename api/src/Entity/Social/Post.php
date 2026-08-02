<?php

namespace App\Entity\Social;

use App\Doctrine\HasMedia;
use App\Doctrine\ORM\TimestampedEntity;
use App\Entity\Tea;
use App\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Index(name: "post_timeline", fields: ["createdAt", "id"])]
class Post implements HasMedia
{
	use TimestampedEntity;

	#[ORM\Id]
	#[ORM\GeneratedValue]
	#[ORM\Column]
	private(set) int $id;

	#[ORM\ManyToOne(targetEntity: User::class)]
	#[ORM\JoinColumn(nullable: false)]
	public User $author;

	#[ORM\Column(type: Types::TEXT, nullable: false)]
	public string $content;

	#[ORM\ManyToMany(targetEntity: Tea::class)]
	public Collection $teas;

	// Requires manual hydration
	public ?Collection $media = null;

	public function __construct()
	{
		$this->teas = new ArrayCollection();
		$this->media = new ArrayCollection();
	}

	public function getMediaType(): string
	{
		return Post::class;
	}
}
