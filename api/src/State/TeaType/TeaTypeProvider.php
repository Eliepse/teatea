<?php

namespace App\State\TeaType;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Origin;
use App\ApiResource\TeaType;
use App\Enum\TeaFamily;
use App\State\OriginProvider;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Query\Expr\Join;

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
		$filters = $context["filters"] ?? [];
		$isCollection = $operation instanceof CollectionOperationInterface;

		$expr = $this->em->getExpressionBuilder();
		$teaQb = $this->em->createQueryBuilder()
			->select("type", "origin")
			->from(\App\Entity\TeaType::class, "type")
			->leftJoin("type.origin", "origin");

		if (false === empty($originPathFilter = $filters["originPath"] ?? null)) {
			// We must get all types with PDO that are included in the given origin
			// + we must get all other types that are not PDO at the country level
			$teaQb->innerJoin("type.origin", "originFilter")
				->andWhere($expr->orX(
					// Match protected origin types if their origin is a descendants
					"CONTAINS(:originPath, originFilter.path) = TRUE AND type.isProtectedOrigin = TRUE",
					// Match all non protected types in the same country
					"CONTAINS(:countryPath, originFilter.path) = TRUE AND type.isProtectedOrigin = FALSE",
				))
				->setParameter("originPath", $originPathFilter)
				->setParameter("countryPath", array_slice(explode(".", $originPathFilter), 0, 1));
		}

		if (false === empty($familyFilter = $filters["family"] ?? null)) {
			$family = TeaFamily::tryFrom($familyFilter);
			$teaQb->andWhere("type.family = :family")
				->setParameter("family", $family);
		}

		if ($isCollection) {
			return array_map(
				fn(\App\Entity\TeaType $type) => static::fromEntity($type),
				$teaQb->getQuery()->getResult(),
			);
		}

		$teaQb->where("type.id = :id")->setParameter("id", $uriVariables["id"]);
		$teaQb->setMaxResults(1);

		/** @var \App\Entity\TeaType|null $typeEntities */
		$typeEntities = $teaQb->getQuery()->getResult()[0] ?? null;
		return static::fromEntity($typeEntities);
	}

	public static function fromEntity(?\App\Entity\TeaType $type): ?TeaType
	{
		if (null === $type) {
			return null;
		}

		$resource = new TeaType();
		$resource->id = $type->getId();
		$resource->name = $type->name;
		$resource->family = $type->family;
		$resource->origin = OriginProvider::fromEntity($type->origin);
		$resource->isProtectedOrigin = $type->isProtectedOrigin;

		return $resource;
	}
}
