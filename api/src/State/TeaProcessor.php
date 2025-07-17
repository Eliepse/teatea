<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\Tea;
use App\DTO\OriginPath;
use App\Entity\Origin;
use App\Entity\TeaType;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Exception\ORMException;

readonly class TeaProcessor implements ProcessorInterface
{
	public function __construct(private EntityManagerInterface $em)
	{
	}

	/**
	 * @param mixed|Tea $data
	 * @param Operation $operation
	 * @param array $uriVariables
	 * @param array $context
	 *
	 * @return mixed
	 * @throws ORMException
	 */
	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
	{
		assert($data instanceof Tea);

		$tea = new \App\Entity\Tea(createdAt: $data->addedAt);
		$tea->family = $data->family;
		$tea->type = $data->type ? $this->em->getReference(TeaType::class, $data->type->id) : null;
		$tea->origin = $this->em->getReference(Origin::class, $data->origin->id);

		$this->em->persist($tea);
		$this->em->flush();

		$resource = new Tea();
		$resource->id = $tea->id;
		$resource->family = $tea->type?->family ?? $tea->family;
		$resource->type = $data->type;
		$resource->origin = OriginProvider::fromEntity($tea->origin);
		$resource->addedAt = $tea->createdAt;

		if (null !== $tea->origin) {
			$nodes = $tea->origin->path->getNodes();
			$paths = [];

			// Reconstruct parent paths
			for ($i = 1; $i <= count($nodes); $i++) {
				$paths[] = join(".", array_slice($nodes, 0, $i));
			}

			$originNodes = $this->em->createQueryBuilder()
				->select("origin")
				->from(Origin::class, "origin")
				->where($this->em->getExpressionBuilder()->in("origin.path", $paths))
				->getQuery()->getResult();

			$resource->originPath = OriginPath::fromNodes($originNodes);
		}

		return $resource;
	}
}
