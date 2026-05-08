<?php

namespace App\MessageHandler\Query;

use App\Message\Query\TeaDuplicatesExistsQuery;
use App\MessageHandler\Contract\QueryHandlerInterface;
use App\Repository\TeaRepository;

final readonly class TeaDuplicatesExistsHandler implements QueryHandlerInterface
{
	public function __construct(
		private TeaRepository $repo,
	) {
	}

	public function __invoke(TeaDuplicatesExistsQuery $query): bool
	{
		$searchQuery = $this->repo->createQueryBuilder("tea")
			->select("count(tea)")
			->where("tea.family = :family")->setParameter("family", $query->family);

		if ($query->typeId) {
			$searchQuery->andWhere("tea.type = :type")
				->setParameter("type", $query->typeId);
		} else {
			$searchQuery->andWhere("tea.type IS NULL");
		}

		if ($query->cultivarId) {
			$searchQuery->andWhere("tea.cultivar = :cultivar")
				->setParameter("cultivar", $query->cultivarId);
		} else {
			$searchQuery->andWhere("tea.cultivar IS NULL");
		}

		if ($query->year) {
			$searchQuery->andWhere("tea.year = :year")
				->setParameter("year", $query->year);
		} else {
			$searchQuery->andWhere("tea.year IS NULL");
		}

		if ($query->roast) {
			$searchQuery->andWhere("tea.roast = :roast")
				->setParameter("roast", $query->roast);
		} else {
			$searchQuery->andWhere("tea.roast IS NULL");
		}

		if ($query->businessId) {
			$searchQuery->andWhere("tea.business = :business")
				->setParameter("business", $query->businessId);
		} else {
			$searchQuery->andWhere("tea.business IS NULL");
		}

		if ($query->originPath) {
			$searchQuery->andWhere("tea.originPath = :origin")
				->setParameter("origin", $query->originPath);
		} else {
			$searchQuery->andWhere("tea.originPath IS NULL");
		}

		return 0 !== $searchQuery->getQuery()->getSingleScalarResult();
	}
}
