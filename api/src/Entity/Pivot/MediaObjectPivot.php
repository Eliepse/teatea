<?php

namespace App\Entity\Pivot;

use App\Doctrine\HasMedia;
use App\Doctrine\ORM\TimestampedEntity;
use App\Entity\MediaObject;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\UniqueConstraint(fields: ["mediableType", "mediableId", "media"])]
final class MediaObjectPivot
{
	use TimestampedEntity;

	#[ORM\Id]
	#[ORM\GeneratedValue]
	#[ORM\Column]
	public ?int $id = null;

	#[ORM\Column(type: Types::TEXT, nullable: false)]
	private(set) string $mediableType;

	#[ORM\Column(type: Types::INTEGER, nullable: false)]
	private(set) int $mediableId;

	#[ORM\Column(type: Types::TEXT, nullable: true)]
	public ?string $collection = null;

	#[ORM\ManyToOne]
	public MediaObject $media;

	// No automatic association mapping with Doctrine
	// Needs to be manually hydrated
	private(set) HasMedia $mediable;

	public function setMediable(HasMedia $mediable): void
	{
		$this->mediable = $mediable;
		$this->mediableType = $mediable->getType();
		$this->mediableId = $mediable->getId();
	}
}
