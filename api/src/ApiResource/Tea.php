<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\DTO\OriginPath;
use App\Enum\TeaFamily;
use App\State\TeaProcessor;
use App\State\TeaProvider;
use Symfony\Component\Serializer\Attribute\Groups;


#[Get(provider: TeaProvider::class)]
#[GetCollection(paginationEnabled: false, provider: TeaProvider::class)]
#[Post(denormalizationContext: ["groups" => ["tea:create"]], processor: TeaProcessor::class)]
class Tea
{
	#[ApiProperty(identifier: true)]
	public ?int $id;

	#[Groups(["tea:create", "embedded:tea"])]
	public TeaFamily $family;

	#[Groups(["tea:create", "embedded:tea"])]
	public ?TeaType $type = null;

	#[ApiProperty(genId: false)]
	#[Groups(["embedded:tea"])]
	public ?OriginPath $originPath = null;

	#[Groups(["tea:create"])]
	public ?Origin $origin = null;

	public \DateTimeImmutable $addedAt;

	public function __construct()
	{
		$this->addedAt = new \DateTimeImmutable();
	}

	#[Groups(["embedded:tea"])]
	public function getDisplayName(): string
	{
		if (null !== $this->type) {
			return $this->type->name;
		}

		return "{$this->family->name} tea";
	}
}
