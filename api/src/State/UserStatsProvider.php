<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\ActivityGraph;
use App\Entity\User;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * @implements ProviderInterface<ActivityGraph|null>
 */
readonly class UserStatsProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
	) {
	}

	public function provide(
		Operation $operation,
		array $uriVariables = [],
		array $context = [],
	): array|null|object {
		$user = $this->security->getUser();
		assert($user instanceof User);

		$drinks = $this->em
			->createQuery("SELECT COUNT(drink) FROM App\Entity\Drink drink WHERE drink.drinker = :user")
			->setParameter("user", $user)
			->getOneOrNullResult(AbstractQuery::HYDRATE_SINGLE_SCALAR);

		$teas = $this->em
			->createQuery(
				<<<DQL
				SELECT COUNT(DISTINCT tea.id)
				FROM App\Entity\Tea tea
					INNER JOIN tea.drinks drink
				WHERE drink.drinker = :user
				DQL,
			)
			->setParameter("user", $user)
			->getOneOrNullResult(AbstractQuery::HYDRATE_SINGLE_SCALAR);

		$resource = new \App\ApiResource\Member();
		$resource->id = $user->id;
		$resource->statsDrinksTotal = $drinks ?: 0;
		$resource->statsConsumedTeasTotal = $teas ?: 0;

		return $resource;
	}
}
