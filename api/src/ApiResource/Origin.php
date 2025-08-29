<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use App\Doctrine\DBAL\Types\ValueObject\LTreePath;
use App\State\OriginProvider;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(security: "is_granted('ROLE_USER')")]
#[Get(provider: OriginProvider::class)]
#[GetCollection(provider: OriginProvider::class)]
class Origin
{
	#[ApiProperty(identifier: true)]
	public ?int $id = null;

	#[ApiProperty(genId: false)]
	public LTreePath $path;

	#[Assert\NotBlank]
	#[Assert\Length(min: 2, max: 24)]
	#[Groups("embedded:originPath")]
	public string $name;

	#[Groups(["embedded:origin"])]
	public function getPath(): array
	{
		return $this->path->getNodes();
	}
}
