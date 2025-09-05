<?php

namespace App\State\Tea;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\TeaStats;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

readonly class TeaStatProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
	{
		assert(false === ($operation instanceof CollectionOperationInterface), "Collection operation not supported");

		$teaId = $uriVariables["teaId"] ?? null;

		if (false === is_int($teaId) || $teaId <= 0) {
			throw new NotFoundHttpException();
		}

		$teaResult = $this->em->createQuery(
			<<<DQL
				SELECT tea.id, COUNT(drink) as drinks, COUNT(DISTINCT drinker) as drinkers
				FROM App\Entity\Tea tea
					LEFT JOIN tea.drinks drink
					LEFT JOIN drink.drinker drinker
				WHERE tea.id = :teaId
				GROUP BY tea.id
				DQL,
		)
			->setParameter("teaId", $teaId)
			->getSingleResult();


		$stats = new TeaStats();
		$stats->teaId = $teaId;
		$stats->drinksCount = $teaResult["drinks"];
		$stats->drinkersCount = $teaResult["drinkers"];
		return $stats;
	}
}
