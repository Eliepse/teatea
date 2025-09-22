<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\State\Cultivar\CultivarCreateProcessor;
use App\State\Cultivar\CultivarProvider;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
	normalizationContext: ["groups" => ["cultivar:read"]],
	denormalizationContext: ["groups" => ["cultivar:write"]],
	security: "is_granted('ROLE_USER')"),
]
#[Get(provider: CultivarProvider::class)]
#[GetCollection(provider: CultivarProvider::class)]
#[Post(processor: CultivarCreateProcessor::class)]
class Cultivar
{
	#[ApiProperty(identifier: true)]
	#[Groups(["cultivar:read", "embedded:cultivar"])]
	public ?int $id = null;

	#[Assert\NotBlank]
	#[Assert\Length(min: 3, max: 32)]
	#[Groups(["cultivar:write", "cultivar:read", "embedded:cultivar"])]
	public string $name;
}
