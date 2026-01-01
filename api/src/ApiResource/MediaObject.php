<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\OpenApi\Model\Operation;
use ApiPlatform\OpenApi\Model\RequestBody;
use App\State\MediaObject\MediaObjectProcessor;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
	types: ['https://schema.org/MediaObject'],
	normalizationContext: ['groups' => ['media_object:read']],
	compositeIdentifier: true,
)]
#[Get(security: "is_granted('ROLE_ADMIN')")]
#[GetCollection(security: "is_granted('ROLE_ADMIN')")]
#[Post(
	inputFormats: ['multipart' => ['multipart/form-data']],
	openapi: new Operation(
		requestBody: new RequestBody(
			content: new \ArrayObject([
				'multipart/form-data' => [
					'schema' => [
						'type' => 'object',
						'properties' => [
							'file' => [
								'type' => 'string',
								'format' => 'binary'
							]
						]
					]
				]
			]),
		),
	),
	processor: MediaObjectProcessor::class,
)]
class MediaObject
{
	#[ApiProperty(identifier: true)]
	public ?int $id = null;

	#[ApiProperty(writable: false, types: ['https://schema.org/contentUrl'])]
	#[Groups(['media_object:read'])]
	public ?string $contentUrl = null;

	#[Assert\NotNull]
	#[Assert\Image(
		maxSize: "5M",
		minWidth: 360,
		minHeight: 120,
		extensions: ["png", "jpeg", "jpg", "tiff", "webp"],
	)]
	public File $file;

//	#[ApiProperty(writable: false)]
//	public ?string $filePath = null;

//	#[Groups(['media_object:read'])]
//	/** @var string[] */
//	public array $tags = [];
}
