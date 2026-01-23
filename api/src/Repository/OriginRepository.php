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
			->innerJoin(Origin::class, "teaOrigin", "ON", "CONTAINS(origin.path, teaOrigin.path) = TRUE")
			->innerJoin(Tea::class, "tea", "ON", "teaOrigin = tea.origin")
			->innerJoin(TeaSession::class, "session", "ON", "tea = session.tea");

		if (null === $queryModifier) {
			return $originQb->getQuery()->getResult();
		}

		return $queryModifier(clone $originQb)->getQuery()->getResult();
	}

	public function byPath(string|LTreePath $path): ?Origin
	{
		$search = $path instanceof LTreePath ? $path : LTreePath::fromString($path);
		return $this->findOneBy(["path" => $search]);
	}

	/**
	 * @param string[] $paths
	 *
	 * @return Origin[]
	 */
	public function findManyWithAncestorNames(array $paths): array
	{
		if (empty($paths)) {
			return [];
		}

		$rows = $this->createQueryBuilder("origin")
			->select("origin", "JSON_AGG(ancestors.name ORDER BY ancestors.path) as names")
			->leftJoin("App\Entity\Origin", "ancestors", "ON", "CONTAINS(ancestors.path, origin.path) = TRUE")
			->where("origin.path IN (:paths)")
			->setParameter("paths", $paths, ArrayParameterType::STRING)
			->groupBy("origin.path")
			->getQuery()
			->getResult();

		return array_map(function ($row) {
			/** @var Origin $origin */
			$origin = $row[0];
			$origin->namePath = array_values(json_decode($row["names"]));
			return $origin;
		}, $rows);
	}

	public function findWithAncestorNames(string $path): Origin|null
	{
		return $this->findManyWithAncestorNames([$path])[0] ?? null;
	}
}
