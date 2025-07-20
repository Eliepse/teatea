<?php

namespace App\Repository;

use App\Entity\Tea;
use App\Enum\TeaFamily;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Tea>
 */
class TeaRepository extends ServiceEntityRepository
{
	public function __construct(ManagerRegistry $registry)
	{
		parent::__construct($registry, Tea::class);
	}

	public function hasDuplicate(TeaFamily $family, int $originId, ?int $typeId): bool
	{
		$qb = $this->createQueryBuilder("tea")
			->select("count(tea)")
			->where("tea.family = :family")->setParameter("family", $family)
			->andWhere("tea.origin = :origin")->setParameter("origin", $originId)
			->andWhere("tea.type = :type");

		if (null !== $typeId) {
			$qb->andWhere("tea.type = :type")->setParameter("type", $typeId);
		} else {
			$qb->andWhere("tea.type IS NULL");
		}

		return 0 !== $qb->getQuery()->getSingleScalarResult();
	}
}
