<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Link;
use App\Doctrine\DBAL\Types\ValueObject\LTreePath;
use App\State\OriginProvider;
use App\State\TeaTypeProvider;

#[GetCollection(
	uriTemplate: "/origins/{originId}/tea_types",
	uriVariables: ['originId' => new Link(fromClass: Origin::class)],
	provider: TeaTypeProvider::class),
]
#[Get(provider: OriginProvider::class)]
#[GetCollection(provider: OriginProvider::class)]
class Origin
{
	#[ApiProperty(identifier: true)]
	public ?int $id = null;

	#[ApiProperty(genId: false)]
	public LTreePath $path;

	public string $name;

	public function getPath(): array
	{
		return $this->path->getNodes();
	}
}
