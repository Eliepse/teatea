<?php

namespace App\State\Origin;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ParameterNotFound;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Origin;
use App\Helper\Arr;
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @implements ProviderInterface<Origin|null>
 */
readonly class OriginCollectionProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): Origin|array|null
	{
		assert($operation instanceof CollectionOperationInterface);

		$searchQb = $this->em->createQueryBuilder()
			->select("origin.id as id", "COUNT(child) as children")
			->from(\App\Entity\Origin::class, "origin")
			->leftJoin(
				\App\Entity\Origin::class,
				"child",
				"WITH",
				"child.id != origin.id AND IS_CONTAINED_BY(child.path, origin.path) = TRUE",
			)
			->groupBy("origin.id");

		// Limit max results
		$limit = $this->getParameter($operation, "limit");
		if (is_int($limit)) {
			$searchQb->setMaxResults($limit);
		}

		// Limit max results
		$sort = $this->getParameter($operation, "sort");
		match ($sort) {
			"popularity" => $searchQb
				->leftJoin("origin.teas", "tea", "WITH", "tea.createdAt >= :teaCreatedAt")
				->setParameter("teaCreatedAt", new \DateTimeImmutable()->sub(new \DateInterval("P3M")))
				->orderBy("COUNT(tea)", "DESC"),
			default => $searchQb->orderBy("origin.name", "ASC"),
		};

		// Filter by parent
		$parentPath = $this->getParameter($operation, "parent");
		if (is_string($parentPath)) {
			$searchQb
				->andWhere("IS_CONTAINED_BY(origin.path, :parentPath) = TRUE")
				->setParameter("parentPath", $parentPath);
		}

		// Filter by level
		$level = $this->getParameter($operation, "level");
		if (is_int($level)) {
			$searchQb
				->andWhere("NLEVEL(origin.path) = :nlevel")
				->setParameter("nlevel", $level);
		}

		$originResults = $searchQb->getQuery()->getResult();

		if (empty($originResults)) {
			return [];
		}

		$originQb = $this->em->createQueryBuilder()
			->select("origin")
			->from(\App\Entity\Origin::class, "origin")
			->where("origin.id IN (:ids)")
			->setParameter("ids", Arr::pluck($originResults, "id", true), ArrayParameterType::INTEGER);

		$originById = Arr::keyBy($originQb->getQuery()->getResult(), "id");

		return array_map(
			function ($row) use ($originById) {
				$entity = $originById[$row["id"]] ?? null;

				if (null === $entity) {
					return null;
				}

				$resource = OriginProvider::fromEntity($entity);
				$resource->isLeaf = empty($row["children"]);
				return $resource;
			},
			$originResults, // Map with the search results to keep the order
		);
	}

	private function getParameter(Operation $operation, string $key): mixed
	{
		$parameter = $operation->getParameters()?->get($key);

		if (null === $parameter) {
			return null;
		}

		$value = $parameter->getValue();
		return $value instanceof ParameterNotFound ? null : $value;
	}
}
