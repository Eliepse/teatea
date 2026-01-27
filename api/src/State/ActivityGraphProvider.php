<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\ActivityGraph;
use App\Entity\User;
use App\Repository\UserRepository;
use App\ValueObject\ActivityGraphDay;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @implements ProviderInterface<ActivityGraph|null>
 */
readonly class ActivityGraphProvider implements ProviderInterface
{
	public function __construct(
		private UserRepository $userRepository,
		private EntityManagerInterface $em,
	) {}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): ?ActivityGraph
	{
		$member = $this->userRepository->findOneBy(["username" => $uriVariables["username"]]);

		if (!$member instanceof User) {
			return null;
		}

		$from = new \DateTimeImmutable()->sub(new \DateInterval("P1Y"))->setTime(0, 0);
		$to = new \DateTimeImmutable()->add(new \DateInterval("P1D"))->setTime(0, 0);

		$statsQB = $this->em
			->getConnection()
			->createQueryBuilder()
			->select("count(*) as total", "session.drank_at::date")
			->from("tea_session", "session")
			->where("session.drank_at >= :from") // Inclusive range
			->andWhere("session.drank_at < :to") // Exclusive range
			->andWhere("session.author_id = :authorId")
			->groupBy("session.drank_at::date")
			->orderBy("session.drank_at::date");

		$statsQB
			->setParameter("from", $from->format("c"))
			->setParameter("to", $to->format("c"))
			->setParameter("authorId", $member->id);

		$data = $statsQB->fetchAllAssociative();

		$totals = array_map(fn($row) => $row["total"], $data);

		if (0 === count($totals)) {
			$graph = new ActivityGraph();
			$graph->year = intval($from->format("Y"));
			$graph->items = [];
			return $graph;
		}

		$min = min($totals);
		$max = max($totals);
		$levelSize = (int) round(($max - $min) / 3);

		$levels = array_map(fn($i) => $min + ($i * $levelSize), array_keys(array_fill(0, 3, null)));
		$levels = array_reverse($levels, true);

		$days = array_map(
			fn(array $row) => new ActivityGraphDay(
				$row["total"],
				\DateTimeImmutable::createFromFormat("Y-m-d", $row["drank_at"]),
				1 + (array_find_key($levels, fn($level) => $level <= $row["total"]) ?? 0),
			),
			$data,
		);

		$graph = new ActivityGraph();
		$graph->year = intval($from->format("Y"));
		$graph->items = $days;
		$graph->levels = count($levels);
		return $graph;
	}
}
