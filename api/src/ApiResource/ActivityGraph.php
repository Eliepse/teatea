<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Get;
use App\State\ActivityGraphProvider;
use App\ValueObject\ActivityGraphDay;

#[Get(provider: ActivityGraphProvider::class)]
class ActivityGraph
{
	#[ApiProperty(identifier: true)]
	public int $year;

	public string $name = "test";

	/** @var ActivityGraphDay[] */
	#[ApiProperty(genId: false)]
	public array $items;
}
