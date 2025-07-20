<?php

namespace App\State;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Origin;
use App\ApiResource\TeaType;
use App\Enum\TeaFamily;
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

		$teaQb = $this->em->createQueryBuilder()
			->select("type")
			->from(\App\Entity\TeaType::class, "type");

		if (false === empty($originFilter = $filters["origin"] ?? null)) {
			$teaQb->innerJoin("type.origin", "origin")
				->innerJoin(\App\Entity\Origin::class, "sourceOrigin", Join::WITH, "sourceOrigin.id = :originId")
				->andWhere("CONTAINS(sourceOrigin.path, origin.path) = TRUE")
				->setParameter("originId", $originFilter);
		}

		if (false === empty($originPathFilter = $filters["originPath"] ?? null)) {
			$teaQb->innerJoin("type.origin", "origin")
				->andWhere("CONTAINS(:originPath, origin.path) = TRUE")
				->setParameter("originPath", $originPathFilter);
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

		$origin = new Origin();
		$origin->id = $type->origin->id;

		$resource = new TeaType();
		$resource->id = $type->getId();
		$resource->name = $type->name;
		$resource->family = $type->family;
		$resource->origin = $origin;
		return $resource;
	}
}
