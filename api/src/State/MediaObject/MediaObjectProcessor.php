<?php

namespace App\State\MediaObject;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\MediaObject;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Vich\UploaderBundle\Storage\StorageInterface;

class MediaObjectProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private StorageInterface $storage,
		#[Autowire("%app.base_url%")]
		private string $baseUrl,
	) {
	}

	public function process(
		mixed $data,
		Operation $operation,
		array $uriVariables = [],
		array $context = [],
	): ?MediaObject {
		assert($data instanceof MediaObject);

		$entity = new \App\Entity\MediaObject();
		$entity->file = $data->file;

		$this->em->persist($entity);
		$this->em->flush();

		$data->id = $entity->id;
		$data->contentUrl = $this->baseUrl . $this->storage->resolveUri($entity, "file");
		return $data;
	}
}
