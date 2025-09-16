<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use App\State\OriginProvider;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(normalizationContext: ["groups" => ["origin:read"]], security: "is_granted('ROLE_USER')")]
#[Get(uriTemplate: "/origins/{path}", provider: OriginProvider::class)]
#[GetCollection(provider: OriginProvider::class)]
class Origin
{
	#[ApiProperty(identifier: true)]
	#[Groups(["origin:read", "embedded:origin"])]
	public string $path;

	#[Assert\NotBlank]
	#[Assert\Length(min: 2, max: 24)]
	#[Groups(["origin:read", "embedded:origin"])]
	public string $name;
}
