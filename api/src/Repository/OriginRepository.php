<?php

namespace App\Repository;

use App\Doctrine\DBAL\Types\ValueObject\LTreePath;
use App\Entity\Origin;
use App\Entity\Tea;
use App\Entity\TeaSession;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\ORM\Query\Expr\Join;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Origin>
 */
class OriginRepository extends ServiceEntityRepository
{
	public function __construct(ManagerRegistry $registry)
	{
		parent::__construct($registry, Origin::class);
	}

	/**
	 * @param (callable(QueryBuilder):QueryBuilder)|null $queryModifier
	 *
	 * @return array<Origin>
	 */
	public function fetchOriginsFromSession(?callable $queryModifier = null): array
	{
		$originQb = $this->createQueryBuilder("origin")
			->select("origin")->distinct()
			->innerJoin(Origin::class, "teaOrigin", "WITH", "CONTAINS(origin.path, teaOrigin.path) = TRUE")
			->innerJoin(Tea::class, "tea", "WITH", "teaOrigin = tea.origin")
			->innerJoin(TeaSession::class, "session", "WITH", "tea = session.tea");

		if (null === $queryModifier) {
			return $originQb->getQuery()->getResult();
		}

		return $queryModifier(clone $originQb)->getQuery()->getResult();
	}

	/**
	 * @param array<int|Origin> $origin
	 *
	 * @return array
	 */
	public function getWithAncestors(array $origin): array
	{
		$originIds = array_unique(array_filter(array_map(fn($o) => $o instanceof Origin ? $o->id : $o, $origin)));

		if (empty($originIds)) {
			return [];
		}

		return $this->createQueryBuilder("O")
			->innerJoin(Origin::class, "base", "WITH", "CONTAINS(O.path, base.path) = TRUE")
			->where("base.id IN (:ids)")
			->setParameter("ids", $originIds)
			->getQuery()
			->getResult();
	}

	public function byPath(string|LTreePath $path): ?Origin
	{
		$search = $path instanceof LTreePath ? $path : LTreePath::fromString($path);
		return $this->findOneBy(["path" => $search]);
	}

	/**
	 * Return the names of ancestors for each given origin
	 *
	 * @param int[] $ids
	 *
	 * @return array<string, string[]>
	 */
	public function getAncestorsNamesByPath(array $ids): array
	{
		if (empty($ids)) {
			return [];
		}

		$rows = $this->createQueryBuilder("origin")
			->select("origin.path as path", "JSON_AGG(ancestors.name ORDER BY ancestors.path) as names")
			->leftJoin("App\Entity\Origin", "ancestors", Join::WITH, "CONTAINS(ancestors.path, origin.path) = TRUE")
			->where("origin.id IN (:ids)")
			->setParameter("ids", $ids, ArrayParameterType::INTEGER)
			->groupBy("origin.path")
			->getQuery()
			->getResult();

		$map = [];

		foreach ($rows as $row) {
			$map[$row["path"]->getPath()] = json_decode($row["names"]);
		}

		return $map;
	}

	/**
	 * @param int[] $ids
	 *
	 * @return Origin[]
	 */
	public function findManyWithAncestorNames(array $ids): array
	{
		if (empty($ids)) {
			return [];
		}

		$rows = $this->createQueryBuilder("origin")
			->select("origin", "JSON_AGG(ancestors.name ORDER BY ancestors.path) as names")
			->leftJoin("App\Entity\Origin", "ancestors", Join::WITH, "CONTAINS(ancestors.path, origin.path) = TRUE")
			->where("origin.id IN (:ids)")
			->setParameter("ids", $ids, ArrayParameterType::INTEGER)
			->groupBy("origin.path")
			->getQuery()
			->getResult();

		return array_map(function ($row) {
			/** @var Origin $origin */
			$origin = $row[0];
			$origin->namePath = array_values(json_decode($row[1]));
			return $origin;
		}, $rows);
	}

	public function findWithAncestorNames(int $id): Origin|null
	{
		return $this->findManyWithAncestorNames([$id])[0] ?? null;
	}
}
