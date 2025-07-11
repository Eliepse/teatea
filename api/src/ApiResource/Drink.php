<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\State\DrinkProcessor;
use App\State\DrinkProvider;
use Symfony\Component\Serializer\Attribute\Groups;

#[Get(provider: DrinkProvider::class)]
#[GetCollection(provider: DrinkProvider::class)]
#[Post(denormalizationContext: ["groups" => ["drink:create"]], processor: DrinkProcessor::class)]
class Drink
{
	#[ApiProperty(identifier: true)]
	public ?int $id = null;

	#[Groups("drink:create")]
	public Tea $tea;

	#[Groups("drink:create")]
	public ?\DateTimeImmutable $drankAt;

	public function __construct()
	{
		$this->drankAt = new \DateTimeImmutable();
	}
}
