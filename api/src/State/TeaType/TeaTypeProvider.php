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
use Doctrine\ORM\Query\ResultSetMappingBuilder;
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
			function (ItemInterface $item) use ($typeEntity) {
				$item->expiresAt(new \DateTimeImmutable()->add(new \DateInterval("P1D"))->setTime(0, 0));

				$query = $this->em->createNativeQuery(
					<<<SQL
					SELECT ranked.rank
					FROM (
						SELECT type.id as id,
							ROW_NUMBER() OVER (ORDER BY
								count(sessions.id) DESC,
								COUNT(DISTINCT teas.id) DESC,
								MAX(type.created_at) DESC
						    ) as rank
						FROM tea_type type
							LEFT JOIN tea as teas ON teas.type_id = type.id
							LEFT JOIN tea_session as sessions ON sessions.tea_id = teas.id AND sessions.drank_at >= :rankSince
						GROUP BY type.id
					) as ranked
					WHERE ranked.id = :typeId
					SQL,
					new ResultSetMapping()->addScalarResult("rank", "rank", Types::INTEGER),
				);

				return $query->setParameter("typeId", $typeEntity->id)
					->setParameter("rankSince", new \DateTimeImmutable()->sub(new \DateInterval("P1M")))
					->getSingleScalarResult();
			},
		);

		$stats = $this->em->createNativeQuery(
			<<<SQL
			SELECT count(DISTINCT teas.id) as teas, count(sessions.id) as sessions
			FROM tea_type
				LEFT JOIN tea as teas ON teas.type_id = tea_type.id
				LEFT JOIN tea_session as sessions ON sessions.tea_id = teas.id
			WHERE tea_type.id = :typeId
			SQL,
			new ResultSetMappingBuilder($this->em)
				->addScalarResult("rank", "rank", Types::INTEGER)
				->addScalarResult("teas", "teas", Types::INTEGER)
				->addScalarResult("sessions", "sessions", Types::INTEGER),
		)
			->setParameter("typeId", $typeEntity->id)
			->getSingleResult();

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
