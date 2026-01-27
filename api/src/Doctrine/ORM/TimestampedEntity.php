<?php

namespace App\Doctrine\ORM;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

trait TimestampedEntity
{
	#[Gedmo\Timestampable(on: "create")]
	#[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
	protected(set) \DateTimeImmutable $createdAt;

	#[Gedmo\Timestampable(on: "update")]
	#[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
	protected(set) \DateTimeImmutable $updatedAt;
}
