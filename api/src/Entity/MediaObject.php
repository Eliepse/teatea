<?php

namespace App\Entity;

use App\Doctrine\HasMedia;
use App\Doctrine\ORM\TimestampedEntity;
use App\Entity\Pivot\MediaObjectPivot;
use App\Repository\MediaObjectRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\File\File;
use Vich\UploaderBundle\Mapping\Attribute as Vich;

#[Vich\Uploadable]
#[ORM\Entity(repositoryClass: MediaObjectRepository::class)]
class MediaObject
{
	use TimestampedEntity;

	#[ORM\Id]
	#[ORM\GeneratedValue]
	#[ORM\Column]
	public ?int $id = null;

	#[Vich\UploadableField(
		mapping: 'media_object',
		fileNameProperty: 'filePath',
		size: "size",
		mimeType: "mimeType",
		dimensions: "dimensions",
	)]
	public ?File $file = null;

	#[ORM\Column(type: Types::TEXT, nullable: true)]
	public ?string $filePath = null;

	#[ORM\Column(type: Types::INTEGER, nullable: true)]
	public ?int $size = null;

	#[ORM\Column(type: Types::TEXT, nullable: true)]
	public ?string $mimeType = null;

	/** @var int[]|null */
	#[ORM\Column(type: Types::JSONB, nullable: true)]
	public ?array $dimensions = null;

	#[ORM\Column(type: Types::TEXT, nullable: true)]
	public ?string $placeholder = null;

	#[ORM\OneToMany(MediaObjectPivot::class, "media", cascade: ["persist", "remove"])]
	public Collection $pivots;

	public function __construct()
	{
		$this->pivots = new ArrayCollection();
	}

	public function attach(HasMedia $mediable): MediaObjectPivot
	{
		$pivot = new MediaObjectPivot();
		$pivot->media = $this;
		$pivot->setMediable($mediable);
		$this->pivots->add($pivot);
		return $pivot;
	}
}
