<?php

namespace App\Entity;

use App\Repository\MediaObjectRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\File\File;
use Vich\UploaderBundle\Mapping\Attribute as Vich;

#[Vich\Uploadable]
#[ORM\Entity(repositoryClass: MediaObjectRepository::class)]
class MediaObject
{
	#[ORM\Id]
	#[ORM\GeneratedValue]
	#[ORM\Column]
	public ?int $id = null;

	#[Vich\UploadableField(
		mapping: 'media_object',
		fileNameProperty: 'filePath',
	)]
	public ?File $file = null;

	#[ORM\Column(type: Types::TEXT, nullable: true)]
	public ?string $filePath = null;
}
