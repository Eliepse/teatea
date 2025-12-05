<?php

namespace App\Repository;

use App\Entity\Tea;
use App\Enum\RoastLevel;
use App\Helper\Arr;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Tea>
 */
class TeaRepository extends ServiceEntityRepository
{
	public function __construct(
		ManagerRegistry $registry,
		private readonly OriginRepository $originRepository,
	)
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

		if (null !== $tea->year) {
			$qb->andWhere("tea.year = :year")->setParameter("year", $tea->year);
		} else {
			$qb->andWhere("tea.year IS NULL");
		}

		if (null !== $tea->roast && RoastLevel::No === $tea->roast) {
			$qb->andWhere("tea.roast = :roast")->setParameter("roast", $tea->roast);
		} else {
			$qb->andWhere("tea.roast IS NULL OR tea.roast = :roast")->setParameter("roast", RoastLevel::No);
		}

		return 0 !== $qb->getQuery()->getSingleScalarResult();
	}

	public function findCompleteById(int $id): Tea|null {
		/** @var \App\Entity\Tea|null $teaEntity */
		$teaEntity = $this->em->createQueryBuilder()
			->select("tea", "type", "cultivar")
			->from(\App\Entity\Tea::class, "tea")
			->leftJoin("tea.type", "type")
			->leftJoin("tea.cultivar", "cultivar")
			->andWhere("tea.id = :teaId")
			->setParameter("teaId", $id)
			->getQuery()->getOneOrNullResult();

		if(null === $teaEntity) {
			return null;
		}

		$origin = $this->originRepository->findManyWithAncestorNames();
	}

	/**
	 * @param int[] $ids
	 *
	 * @return array
	 */
	public function findCompleteByIds(array $ids): array {
		if(empty($ids)) {
			return [];
		}

		/** @var \App\Entity\Tea|null $teaEntity */
		$teaEntities = $this->createQueryBuilder("tea")
			->select("tea", "type", "cultivar")
			->leftJoin("tea.type", "type")
			->leftJoin("tea.cultivar", "cultivar")
			->andWhere("tea.id IN (:teaId)")
			->setParameter("teaId", $id)
			->getQuery()->getResult();

		if(empty($teaEntities)) {
			return [];
		}

		$originIds = array_filter(Arr::pluck($teaEntities, fn(Tea $tea) => $tea->origin?->id, true));
		$originsById = Arr::keyBy($this->originRepository->findManyWithAncestorNames($originIds), "id");

		return array_map(function () use ($originsById) {}, $teaEntities);
	}
}
