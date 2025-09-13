<?php

namespace App\Repository;

use App\Entity\TeaSession;
use App\Entity\Origin;
use App\Entity\Tea;
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
}
