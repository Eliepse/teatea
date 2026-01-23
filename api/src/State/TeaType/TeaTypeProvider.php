<?php

namespace App\State\TeaType;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\TeaType;
use App\Helper\OperationHelper;
use App\State\Origin\OriginProvider;
use App\ValueObject\Stats\TeaTypeStats;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Query\ResultSetMapping;
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
			"tea_types.$typeEntity->id.rank",
			function (ItemInterface $item) use ($typeEntity, $originPath) {
				$item->expiresAt(new \DateTimeImmutable()->sub(new \DateInterval("P1D"))->setTime(0, 0));

				$rankQuery = $this->em->getConnection()->createQueryBuilder()
					->select("type.id as id")
					->addSelect(
						"ROW_NUMBER() OVER (ORDER BY
							count(sessions.id) DESC,
							COUNT(DISTINCT teas.id) DESC,
							MAX(type.created_at) DESC
						) as rank",
					)
					->from("tea_type", "type")
					->leftJoin("type", "tea", "teas", "teas.type_id = type.id")
					->leftJoin(
						"teas",
						"tea_session",
						"sessions",
						"sessions.tea_id = teas.id AND sessions.drank_at >= :rankSince",
					)
					->groupBy("type.id");

				if (null !== $originPath) {
					$rankQuery->andWhere(":origin @> teas.origin_path")
						->setParameter("origin", $originPath);
				}

				$query = $this->em->createNativeQuery(
					<<<SQL
					SELECT ranked.rank
					FROM ({$rankQuery->getSQL()}) as ranked
					WHERE ranked.id = :typeId
					SQL,
					new ResultSetMapping()->addScalarResult("rank", "rank", Types::INTEGER),
				);

				$query->setParameters($rankQuery->getParameters());

				return $query->setParameter("typeId", $typeEntity->id)
					->setParameter("rankSince", new \DateTimeImmutable()->sub(new \DateInterval("P1M")))
					->getSingleScalarResult();
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
