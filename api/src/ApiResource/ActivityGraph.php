<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use App\State\ActivityGraphProvider;
use App\ValueObject\ActivityGraphDay;

#[ApiResource(security: "is_granted('ROLE_USER')")]
#[Get(provider: ActivityGraphProvider::class)]
class ActivityGraph
{
	#[ApiProperty(identifier: true)]
	public int $year;

	public string $name = "test";

	public int $levels = 1;

	/** @var ActivityGraphDay[] */
	#[ApiProperty(genId: false)]
	public array $items;
}
