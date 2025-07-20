<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\Tea;
use App\ApiResource\TeaType;
use App\DTO\OriginPath;
use App\Entity\Origin;
use App\Repository\TeaRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Exception\ORMException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

readonly class TeaProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private TeaRepository $repository,
	) {
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

		// TODO: check if the tea's origin is equal or child of the type's origin (if type already exist)
		$origin = $this->em->find(Origin::class, $data->origin->id);
		$type = $data->type;

		// TODO: if type exists, not AOP and tea.origin != type.orin -> create a new one ?

		if ($type instanceof TeaType && null === $type->id) {
			// TODO: check if the type doesn't already exists
			$typeEntity = new \App\Entity\TeaType();
			$typeEntity->family = $data->family;
			$typeEntity->name = trim($data->type->name);
			$typeEntity->origin = $origin;
			$this->em->persist($typeEntity);
			$this->em->flush();

			$type = TeaTypeProvider::fromEntity($typeEntity);
		}

		$tea = new \App\Entity\Tea(createdAt: $data->addedAt);
		$tea->family = $data->family;
		$tea->type = null !== $type ? $this->em->getReference(\App\Entity\TeaType::class, $type->id) : null;
		$tea->origin = $origin;

		if ($tea->family !== $type->family) {
			throw new BadRequestHttpException("The tea cannot have a different family than the selected type");
		}

		if ($this->repository->hasDuplicate($tea->family, $tea->origin->id, $tea->type?->getId())) {
			throw new BadRequestHttpException("This tea already exists");
		}

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
