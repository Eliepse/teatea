<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use App\State\Tea\TeaStatProvider;

#[ApiResource(security: "is_granted('ROLE_USER')")]
#[Get(uriTemplate: "/teas/{teaId}/stats", provider: TeaStatProvider::class)]
class TeaStats
{
	#[ApiProperty(identifier: true)]
	public int $teaId;

	public int $drinksCount;

	public int $drinkersCount;
}
