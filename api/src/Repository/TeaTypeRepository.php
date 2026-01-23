<?php

namespace App\Repository;

use App\Entity\TeaType;
use App\Helper\Arr;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<TeaType>
 */
class TeaTypeRepository extends ServiceEntityRepository
{
	public function __construct(ManagerRegistry $registry)
	{
		parent::__construct($registry, TeaType::class);
	}

	/**
	 * @return array<string, TeaType>
	 */
	public function getFamilies(): array
	{
		$types = $this->createQueryBuilder("T")->where("T.isFamily = TRUE")->getQuery()->getResult();
		return Arr::keyBy($types, fn($t) => $t->family->value);
	}
}
