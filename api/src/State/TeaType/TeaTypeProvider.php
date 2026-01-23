<?php

namespace App\State\TeaType;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\TeaType;
use App\Helper\OperationHelper;
use App\State\Origin\OriginProvider;
use App\ValueObject\Stats\TeaTypeStats;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

/**
 * @implements ProviderInterface<TeaType|null>
 */
readonly class TeaTypeProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private CacheInterface $cacheAppStats,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): TeaType|null
	{
		$originPath = OperationHelper::getParameter($operation, "origin");

		$typeQb = $this->em->createQueryBuilder()
			->select("type")
			->from(\App\Entity\TeaType::class, "type")
			->where("type.slug = :slug")->setParameter("slug", $uriVariables["slug"])
			->setMaxResults(1);

		if (null !== $originPath) {
			$typeQb
				->innerJoin("type.teas", "tea", "WITH", "TRUE = CONTAINS(:parentOrigin, tea.originPath)")
				->setParameter("parentOrigin", $originPath);
		}

		/** @var \App\Entity\TeaType|null $typeEntity */
		$typeEntity = $typeQb->getQuery()->getOneOrNullResult();

		$origin = null !== $originPath ? $this->em
			->createQuery("SELECT o FROM App\Entity\Origin o WHERE o.path = :path")
			->setParameter("path", $originPath)
			->getSingleResult() : null;

		$resource = static::fromEntity($typeEntity);

		if (null === $resource) {
			return null;
		}

		$rank = $this->cacheAppStats->get(
			"tea_types.$typeEntity->id.$originPath.rank",
			function (ItemInterface $item) use ($typeEntity, $originPath) {
				$item->expiresAt(new \DateTimeImmutable()->add(new \DateInterval("P1D"))->setTime(0, 0));

				$rankQuery = $this->em->getConnection()->createQueryBuilder()
					->select("tea.type_id AS id", "origin.path AS path")
					->addSelect(
						"ROW_NUMBER() OVER (ORDER BY
							count(sessions.id) DESC,
							COUNT(DISTINCT tea.id) DESC,
							MAX(tea.created_at) DESC
						) AS rank",
					)
					->from("tea", "tea")
					->leftJoin("tea", "origin", "origin", "SUBPATH(tea.origin_path, 0, 1) = origin.path")
					->leftJoin(
						"tea",
						"tea_session",
						"sessions",
						"sessions.tea_id = tea.id AND sessions.drank_at >= :rankSince",
					)
					->groupBy("tea.type_id", "origin.path");

				$query = $this->em->getConnection()->createQueryBuilder()
					->select("ranked.rank")
					->from("({$rankQuery->getSQL()})", "ranked")
					->where("ranked.id = :typeId")
					->orderBy("ranked.rank")
					->setMaxResults(1)
					->setParameters($rankQuery->getParameters())
					->setParameter("typeId", $typeEntity->id)
					->setParameter(
						"rankSince",
						new \DateTimeImmutable()->sub(new \DateInterval("P1M"))->format("Y-m-d H:i:s"),
					);

				if (null !== $originPath) {
					$query->andWhere("ranked.path @> :origin")->setParameter("origin", $originPath);
				}

				return $query->fetchOne();
			},
		);

		$statsQuery = $this->em->getConnection()->createQueryBuilder()
			->select("COUNT(DISTINCT tea.id) as teas")
			->addSelect("COUNT(DISTINCT sessions.id) as sessions")
			->from("tea", "tea")
			->leftJoin("tea", "tea_session", "sessions", "sessions.tea_id = tea.id")
			->where("tea.type_id = :typeId")
			->setParameter("typeId", $typeEntity->id);

		if (null !== $originPath) {
			$statsQuery->andWhere(":origin @> tea.origin_path")->setParameter("origin", $originPath);
		}

		$stats = $statsQuery->fetchAssociative();

		$resource->stats = new TeaTypeStats($rank, $stats["teas"], $stats["sessions"]);

		if (null !== $origin) {
			$resource->origin = OriginProvider::fromEntity($origin);
		}

		return $resource;
	}

	public static function fromEntity(?\App\Entity\TeaType $type): ?TeaType
	{
		if (null === $type) {
			return null;
		}

		$resource = new TeaType();
		$resource->name = $type->name;
		$resource->slug = $type->slug;
		$resource->family = $type->family;

		return $resource;
	}
}
