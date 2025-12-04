<?php

namespace App\State\Cultivar;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Cultivar;
use App\ApiResource\TeaType;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @implements ProviderInterface<Cultivar|null>
 */
readonly class CultivarProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): Cultivar|array|null
	{
		$filters = $context["filters"] ?? [];
		$isCollection = $operation instanceof CollectionOperationInterface;

		$expr = $this->em->getExpressionBuilder();
		$cultivarQb = $this->em->createQueryBuilder()
			->select("cultivar")
			->from(\App\Entity\Cultivar::class, "cultivar");

		if ($isCollection) {
			return array_map(
				fn(\App\Entity\Cultivar $cultivar) => static::fromEntity($cultivar),
				$cultivarQb->getQuery()->getResult(),
			);
		}

		$cultivarQb
			->where("cultivar.id = :id")
			->setParameter("id", $uriVariables["id"])
			->setMaxResults(1);

		return static::fromEntity($cultivarQb->getQuery()->getResult()[0] ?? null);
	}

	public static function fromEntity(?\App\Entity\Cultivar $cultivar): ?Cultivar
	{
		if (null === $cultivar) {
			return null;
		}

		$resource = new Cultivar();
		$resource->id = $cultivar->id;
		$resource->name = $cultivar->name;

		return $resource;
	}
}
