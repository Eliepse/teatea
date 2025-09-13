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
				SELECT tea.id, COUNT(session) as sessions, COUNT(DISTINCT author) as authors
				FROM App\Entity\Tea tea
					LEFT JOIN tea.sessions session
					LEFT JOIN session.author author
				WHERE tea.id = :teaId
				GROUP BY tea.id
				DQL,
		)
			->setParameter("teaId", $teaId)
			->getSingleResult();


		$stats = new TeaStats();
		$stats->teaId = $teaId;
		$stats->sessionsCount = $teaResult["sessions"];
		$stats->authorsCount = $teaResult["authors"];
		return $stats;
	}
}
