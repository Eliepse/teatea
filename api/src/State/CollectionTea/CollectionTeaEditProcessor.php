<?php

namespace App\State\CollectionTea;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\CollectionTea;
use Doctrine\ORM\EntityManagerInterface;

readonly class CollectionTeaEditProcessor implements ProcessorInterface
{
	public function __construct(private EntityManagerInterface $em)
	{
	}

	public function process(
		mixed $data,
		Operation $operation,
		array $uriVariables = [],
		array $context = [],
	): CollectionTea {
		assert($data instanceof CollectionTea);

		$entity = $this->em->find(\App\Entity\CollectionTea::class, $data->id);
		$entity->description = $data->description;
		$entity->acquiredAt = $data->acquiredAt;
		$entity->acquiredFrom = $data->acquiredFrom ? $this->em->getReference(
			\App\Entity\Business::class,
			$data->acquiredFrom->id,
		) : null;
		$this->em->persist($entity);
		$this->em->flush();

		return CollectionTeaProvider::fromEntity($entity);
	}
}
