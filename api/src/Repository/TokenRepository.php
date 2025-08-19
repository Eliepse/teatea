<?php

namespace App\Repository;

use App\Entity\Token;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Token>
 * @method void removeRequests(object $user)
 */
class TokenRepository extends ServiceEntityRepository
{
	public function __construct(ManagerRegistry $registry)
	{
		parent::__construct($registry, Token::class);
	}

	public function findTokenFromKey(string $key): ?Token
	{
		return $this->createQueryBuilder("T")
			->where("T.tokenKey = :key")->setParameter("key", $key)
			->getQuery()->getSingleResult();
	}

	public function removeExpiredTokens(): void
	{
		$this->createQueryBuilder("T")
			->delete()
			->where("T.expiredAt IS NOT NULL AND T.expiredAt <= :threshold")
			->setParameter("threshold", new \DateTimeImmutable())
			->getQuery()
			->execute();
	}
}
