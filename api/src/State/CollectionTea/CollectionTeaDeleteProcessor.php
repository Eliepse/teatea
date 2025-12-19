<?php

namespace App\State\CollectionTea;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\CollectionTea;
use App\ApiResource\TeaSession;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @implements ProcessorInterface<CollectionTea>
 */
readonly class CollectionTeaDeleteProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
	) {
	}

	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): void
	{
		assert($data instanceof CollectionTea);

		$entity = $this->em->find(\App\Entity\CollectionTea::class, $data->id);
		$this->em->remove($entity);
		$this->em->flush();
	}
}
