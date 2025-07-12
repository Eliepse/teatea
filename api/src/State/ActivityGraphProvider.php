<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\ActivityGraph;
use App\Entity\User;
use App\ValueObject\ActivityGraphDay;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * @implements ProviderInterface<ActivityGraph|null>
 */
readonly class ActivityGraphProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
	) {
	}

	public function provide(
		Operation $operation,
		array $uriVariables = [],
		array $context = [],
	): array|null|object {
		$user = $this->security->getUser();

		assert($user instanceof User);

		$year = intval($uriVariables["year"]);
		$from = new \DateTimeImmutable()->setDate($year, 0, 0)->setTime(0, 0);
		$to = new \DateTimeImmutable()->setDate($year + 1, 0, 0)->setTime(0, 0);

		$statsQB = $this->em->getConnection()->createQueryBuilder()
			->select("count(*) as total", "drink.drank_at::date")
			->from("drink")
			->where("drink.drank_at >= :from") // Inclusive range
			->andWhere("drink.drank_at < :to") // Exclusive range
			->andWhere("drink.drinker_id = :drinkerId")
			->groupBy("drink.drank_at::date")
			->orderBy("drink.drank_at::date");

		$statsQB
			->setParameter("from", $from->format("c"))
			->setParameter("to", $to->format("c"))
			->setParameter("drinkerId", $user->id);

		$data = $statsQB->fetchAllAssociative();

		$days = array_map(
			fn(array $row) => new ActivityGraphDay(
				$row["total"],
				\DateTimeImmutable::createFromFormat("Y-m-d", $row["drank_at"]),
			),
			$data,
		);

		$graph = new ActivityGraph();
		$graph->year = $year;
		$graph->items = $days;
		return $graph;
	}
}
