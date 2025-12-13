<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\QueryParameter;
use App\State\Business\BusinessCreateProcessor;
use App\State\Business\BusinessPaginatedProvider;
use App\State\Business\BusinessProvider;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
	denormalizationContext: ["groups" => ["business:write"]],
	security: "is_granted('ROLE_USER')",
)]
#[Get(provider: BusinessProvider::class)]
#[GetCollection(
	paginationEnabled: true,
	paginationItemsPerPage: 15,
	paginationMaximumItemsPerPage: 50,
	paginationClientItemsPerPage: true,
	provider: BusinessPaginatedProvider::class,
	parameters: [
		"q" => new QueryParameter(property: 'hydra:freetextQuery', description: "Filter by name"),
	],
)]
#[Post(processor: BusinessCreateProcessor::class)]
#[Groups(["with:business"])]
class Business
{
	#[ApiProperty(identifier: true)]
	public ?int $id = null;

	#[Assert\NotBlank]
	#[Assert\Length(min: 2, max: 32)]
	#[Groups(["business:write"])]
	public string $name;
}
