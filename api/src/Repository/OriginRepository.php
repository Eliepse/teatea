<?php

namespace App\Repository;

use App\Doctrine\DBAL\Types\ValueObject\LTreePath;
use App\Entity\Origin;
use App\Entity\Tea;
use App\Entity\TeaSession;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
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
}
