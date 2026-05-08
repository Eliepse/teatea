<?php

namespace App\MessageHandler\Query;

use App\Message\Query\TeaDuplicatesExistsQuery;
use App\MessageHandler\Contract\QueryHandlerInterface;
use App\Repository\TeaRepository;

final readonly class FindTeaDuplicatesHandler implements QueryHandlerInterface
{
	public function __construct(
		private TeaRepository $repo,
	) {
	}

	public function __invoke(TeaDuplicatesExistsQuery $query): bool
	{
		$searchQuery = $this->repo->createQueryBuilder("tea")
			->select("count(tea)")
			->andWhere("tea.family = :family")->setParameter("family", $query->family)
			->andWhere("tea.type = :type")->setParameter("type", $query->typeId)
			->andWhere("tea.cultivar = :cultivar")->setParameter("cultivar", $query->cultivarId)
			->andWhere("tea.year = :year")->setParameter("year", $query->year)
			->andWhere("tea.roast = :roast")->setParameter("roast", $query->roast);

		if ($query->originPath) {
			$searchQuery
				->innerJoin("tea.origin", "origin", "WITH", "origin.path = :origin")
				->setParameter("origin", $query->originPath);
		} else {
			$searchQuery->andWhere("tea.origin IS NULL");
		}

		return 0 !== $searchQuery->getQuery()->getSingleScalarResult();
	}
}
