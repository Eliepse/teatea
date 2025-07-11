<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\Tea;
use App\DTO\OriginPath;
use App\Entity\Origin;
use Doctrine\ORM\EntityManagerInterface;

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
	 */
	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
	{
		if (false === is_a($data, Tea::class)) {
			throw new \RuntimeException("Expected a App\Resource\Tea");
		}

		$tea = new \App\Entity\Tea(createdAt: $data->addedAt);
		$tea->family = $data->family;
		$tea->type = $data->type;
		$tea->origin = $data->origin;
		$tea->name = $data->name;

		$this->em->persist($tea);
		$this->em->flush();

		$resource = new Tea(
			family: $tea->family,
			id: $tea->id,
			type: $tea->type,
			origin: $tea->origin,
			name: $tea->name,
			addedAt: $tea->createdAt,
		);

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
