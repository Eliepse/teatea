<?php

namespace App\State\Origin;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ParameterNotFound;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Origin;
use App\Doctrine\DBAL\Types\ValueObject\LTreePath;
use App\Helper\Arr;
use App\Helper\OperationHelper;
use App\Repository\OriginRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @implements ProviderInterface<Origin[]>
 */
readonly class OriginCollectionProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private OriginRepository $originRepo,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): array
	{
		assert($operation instanceof CollectionOperationInterface);
		$limit = OperationHelper::getParameter($operation, "limit", castFn: "intval");

		$searchQb = $this->em
			->getConnection()
			->createQueryBuilder()
			->select("origin.path as path", "COUNT(DISTINCT child) as children")
			->from("origin", "origin")
			->leftJoin(
				"origin",
				"origin",
				"child",
				"child.path <> origin.path AND child.path <@ origin.path",
			)
			->groupBy("origin.path");

		// Limit max results
		if (null !== $limit) {
			$searchQb->setMaxResults($limit);
		}

		// Limit max results
		$sort = $this->getParameter($operation, "sort");
		match ($sort) {
			"popularity" => $searchQb
				->leftJoin("origin", "tea", "tea", "tea.origin_path <@ origin.path AND tea.created_at >= :teaCreatedAt")
				->setParameter("teaCreatedAt", new \DateTimeImmutable()->sub(new \DateInterval("P3M")), Types::DATETIME_IMMUTABLE)
				->andHaving("COUNT(DISTINCT tea) > 0")
				->orderBy("COUNT(DISTINCT tea)", "DESC"),
			default => $searchQb->orderBy("origin.name", "ASC"),
		};

		// Filter by parent
		$parentPath = $this->getParameter($operation, "parent");
		if (is_string($parentPath)) {
			$searchQb->andWhere("origin.path <@ :parentPath")->setParameter("parentPath", $parentPath);
		}

		// Filter by level
		$level = $this->getParameter($operation, "level");
		if (is_int($level)) {
			$searchQb->andWhere("NLEVEL(origin.path) = :nlevel")->setParameter("nlevel", $level);
		}

		/** @var array{ path: LTreePath, children: int }[] $searchResults */
		$searchResults = $searchQb->fetchAllAssociative();

		if (empty($searchResults)) {
			return [];
		}

		$originPaths = Arr::pluck($searchResults, "path", true);
		$originsByPath = Arr::keyBy(
			$this->originRepo->findManyWithAncestorNames($originPaths),
			fn(\App\Entity\Origin $o) => $o->path->getPath(),
		);

		return array_map(
			function ($row) use ($originsByPath) {
				$entity = $originsByPath[$row["path"]] ?? null;

				if (null === $entity) {
					return null;
				}

				$resource = OriginProvider::fromEntity($entity);
				$resource->isLeaf = empty($row["children"]);
				return $resource;
			},
			$searchResults, // Map with the search results to keep the order
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
