<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use App\Doctrine\DBAL\Types\ValueObject\LTreePath;
use App\State\OriginProvider;
use Symfony\Component\Serializer\Attribute\Groups;

#[Get(provider: OriginProvider::class)]
#[GetCollection(provider: OriginProvider::class)]
class Origin
{
	#[ApiProperty(identifier: true)]
	public ?int $id = null;

	#[ApiProperty(genId: false)]
	public LTreePath $path;

	public string $name;

	#[Groups(["embedded:origin"])]
	public function getPath(): array
	{
		return $this->path->getNodes();
	}
}
