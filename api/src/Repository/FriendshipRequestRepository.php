<?php

namespace App\Repository;

use App\Entity\Pivot\FriendshipRequest;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<FriendshipRequest>
 */
class FriendshipRequestRepository extends ServiceEntityRepository
{
	public function __construct(ManagerRegistry $registry)
	{
		parent::__construct($registry, FriendshipRequest::class);
	}
}
