<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Post;
use App\DTO\OriginPath;
use App\Enum\TeaFamily;
use App\State\Tea\TeaCreateFromTypeProcessor;
use App\State\Tea\TeaCreateProcess;
use App\State\Tea\TeaProvider;
use Symfony\Component\Serializer\Attribute\Groups;


#[Get(
	normalizationContext: ["groups" => ["tea:read", "embedded:teaType", "embedded:originPath"]],
	provider: TeaProvider::class),
]
#[GetCollection(
	paginationEnabled: false,
	normalizationContext: ["groups" => ["tea:read", "embedded:teaType", "embedded:originPath"]],
	provider: TeaProvider::class,
)]
#[Post(
	normalizationContext: ["groups" => ["tea:read"]],
	denormalizationContext: ["groups" => ["tea:create"]],
	security: "is_granted('ROLE_USER')",
	processor: TeaCreateProcess::class,
)]
#[Post(
	uriTemplate: "/tea_types/{typeId}/teas",
	uriVariables: ["typeId" => new Link(toProperty: "type", fromClass: TeaType::class)],
	normalizationContext: ["groups" => ["tea:read"]],
	denormalizationContext: ["groups" => ["tea:createFromType"]],
	security: "is_granted('ROLE_USER')",
	processor: TeaCreateFromTypeProcessor::class,
)]
class Tea
{
	#[ApiProperty(identifier: true)]
	#[Groups(["tea:read"])]
	public ?int $id;

	#[Groups(["tea:create", "tea:read", "embedded:tea"])]
	public TeaFamily $family;

	#[Groups(["tea:create", "tea:read", "embedded:tea"])]
	public ?TeaType $type = null;

	#[ApiProperty(genId: false)]
	#[Groups(["embedded:tea", "embedded:originPath"])]
	public ?OriginPath $originPath = null;

	#[Groups(["tea:create", "tea:read", "tea:createFromType"])]
	public ?Origin $origin = null;

	public \DateTimeImmutable $addedAt;

	public function __construct()
	{
		$this->addedAt = new \DateTimeImmutable();
	}

	#[Groups(["tea:read", "embedded:tea"])]
	public function getDisplayName(): string
	{
		if (null !== $this->type) {
			return $this->type->name;
		}

		return "{$this->family->name} tea";
	}
}
