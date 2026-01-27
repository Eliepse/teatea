<?php

namespace App\Repository;

use App\Entity\Teaware;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Teaware>
 */
class TeawareRepository extends ServiceEntityRepository
{
	public function __construct(ManagerRegistry $registry)
	{
		parent::__construct($registry, Teaware::class);
	}

	//    /**
	//     * @return Teaware[] Returns an array of Teaware objects
	//     */
	//    public function findByExampleField($value): array
	//    {
	//        return $this->createQueryBuilder('t')
	//            ->andWhere('t.exampleField = :val')
	//            ->setParameter('val', $value)
	//            ->orderBy('t.id', 'ASC')
	//            ->setMaxResults(10)
	//            ->getQuery()
	//            ->getResult()
	//        ;
	//    }
	//    public function findOneBySomeField($value): ?Teaware
	//    {
	//        return $this->createQueryBuilder('t')
	//            ->andWhere('t.exampleField = :val')
	//            ->setParameter('val', $value)
	//            ->getQuery()
	//            ->getOneOrNullResult()
	//        ;
	//    }
}
