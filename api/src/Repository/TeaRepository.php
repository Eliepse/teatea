<?php

namespace App\Repository;

use App\Entity\Tea;
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

	public function hasDuplicate(Tea $tea): bool
	{
		$qb = $this->createQueryBuilder("tea")
			->select("count(tea)")
			->where("tea.family = :family")->setParameter("family", $tea->family)
			->andWhere("tea.origin = :origin")->setParameter("origin", $tea->origin);

		if (null !== $tea->type?->id) {
			$qb->andWhere("tea.type = :type")->setParameter("type", $tea->type);
		} else {
			$qb->andWhere("tea.type IS NULL");
		}

		if (null !== $tea->cultivar?->id) {
			$qb->andWhere("tea.cultivar = :cultivar")->setParameter("cultivar", $tea->cultivar);
		} else {
			$qb->andWhere("tea.cultivar IS NULL");
		}

		return 0 !== $qb->getQuery()->getSingleScalarResult();
	}
}
