<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\DTO\OriginPath;
use App\Entity\Origin;
use App\Entity\TeaType;
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

	#[Groups("tea:create")]
	public TeaFamily $family;

	#[Groups("tea:create")]
	public ?TeaType $type = null;

	#[ApiProperty(genId: false)]
	public ?OriginPath $originPath = null;

	#[Groups("tea:create")]
	public ?Origin $origin = null;

	#[Groups("tea:create")]
	public ?string $name = null;

	public \DateTimeImmutable $addedAt;

	public function __construct()
	{
		$this->addedAt = new \DateTimeImmutable();
	}

	public function getDisplayName(): string
	{
		if (false === empty($this->name)) {
			return $this->name;
		}

		if (null !== $this->type) {
			return $this->type->name;
		}

		return "{$this->family->name} tea";
	}
}
