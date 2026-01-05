<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Post;
use ApiPlatform\OpenApi\Model\Operation;
use ApiPlatform\OpenApi\Model\RequestBody;
use App\State\MediaObject\CollectionTeaMediaProcessor;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
	types: ['https://schema.org/MediaObject'],
	inputFormats: ['multipart' => ['multipart/form-data']],
	normalizationContext: ['groups' => ["read:media", "with:media"]],
	compositeIdentifier: true,
)]
#[Get(security: "is_granted('ROLE_ADMIN')")]
#[GetCollection(security: "is_granted('ROLE_ADMIN')")]
#[Post(
	uriTemplate: "/members/{username}/teas/{id}/media",
	uriVariables: [
		"username" => new Link(
			fromProperty: "username",
			fromClass: Member::class,
			compositeIdentifier: true,
			required: true,
		),
		"id" => new Link(identifiers: ["id"]),
	],
	openapi: new Operation(
		requestBody: new RequestBody(
			content: new \ArrayObject([
				'multipart/form-data' => [
					'schema' => [
						'type' => 'object',
						'properties' => ['file' => ['type' => 'string', 'format' => 'binary']],
					]
				]
			]),
		),
	),
	security: "is_granted('ROLE_USER') and user.username === request.attributes.get('username')",
	processor: CollectionTeaMediaProcessor::class
)]
class MediaObject
{
	#[ApiProperty(identifier: true)]
	public ?int $id = null;

	#[ApiProperty(writable: false, types: ['https://schema.org/contentUrl'])]
	#[Groups(["read:media", "with:media"])]
	public ?string $contentUrl = null;

	#[Assert\NotNull]
	#[Assert\Image(
		maxSize: "5M",
		minWidth: 360,
		minHeight: 120,
		extensions: ["png", "jpeg", "jpg", "tiff", "webp"],
	)]
	public File $file;

	#[Groups(["read:media", "with:media"])]
	public ?string $collection = null;

	#[Groups(["read:media", "with:media"])]
	public ?string $placeholder = null;
}
