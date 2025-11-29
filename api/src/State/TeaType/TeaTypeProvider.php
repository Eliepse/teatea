<?php

namespace App\State\TeaType;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\TeaType;
use App\State\Origin\OriginProvider;
use App\ValueObject\Stats\TeaTypeStats;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Query\ResultSetMappingBuilder;
use Doctrine\Persistence\Proxy;

/**
 * @implements ProviderInterface<TeaType|null>
 */
readonly class TeaTypeProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): TeaType|array|null
	{
		$typeQb = $this->em->createQueryBuilder()
			->select("type", "origin")
			->from(\App\Entity\TeaType::class, "type")
			->leftJoin("type.origin", "origin")
			->where("type.slug = :slug")->setParameter("slug", $uriVariables["slug"])
			->setMaxResults(1);

		/** @var \App\Entity\TeaType|null $typeEntity */
		$typeEntity = $typeQb->getQuery()->getOneOrNullResult();

		$resource = static::fromEntity($typeEntity);

		if (null === $resource) {
			return null;
		}

		$rank = $this->em->createNativeQuery(
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
			new ResultSetMappingBuilder($this->em)->addScalarResult("rank", "rank", Types::INTEGER),
		)
			->setParameter("typeId", $typeEntity->id)
			->setParameter("rankSince", new \DateTimeImmutable()->sub(new \DateInterval("P1M")))
			->getSingleScalarResult();

		$stats = $this->em->createNativeQuery(
			<<<SQL
			SELECT count(DISTINCT teas.id) as teas, count(sessions.id) as sessions
			FROM tea_type tea_type
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
		return $resource;
	}

	public static function fromEntity(?\App\Entity\TeaType $type): ?TeaType
	{
		if (null === $type) {
			return null;
		}

		$resource = new TeaType();
		$resource->id = $type->getId();
		$resource->name = $type->name;
		$resource->slug = $type->slug;
		$resource->family = $type->family;

		if ($type->origin && !$type->origin instanceof Proxy) {
			$resource->origin = OriginProvider::fromEntity($type->origin);
		}

		$resource->isPDO = $type->isProtectedOrigin;

		return $resource;
	}
}
