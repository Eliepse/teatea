<?php

declare(strict_types=1);

namespace App\Controller\Stats;

use App\DTO\Request\Stats\MemberFamiliesStatsQueryString;
use App\Entity\Tea;
use App\Entity\User;
use App\Helper\Arr;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Doctrine\Attribute\MapEntity;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapQueryString;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/members/{username}/tea-families/stats')]
class MemberFamiliesStatsController extends AbstractController
{
	public function __invoke(
		#[MapEntity(mapping: ["username" => "username"])]
		User $member,
		#[MapQueryString]
		MemberFamiliesStatsQueryString $query,
		EntityManagerInterface $em,
	): JsonResponse {
		$since = ($query->since ?? new \DateTimeImmutable()->sub(new \DateInterval("P12M")));

		$statQuery = $em->createQueryBuilder()
			->select("tea.family", "count(session) as total")
			->from(Tea::class, "tea")
			->leftJoin("tea.sessions", "session")
			->where("session.drankAt >= :since")
			->andWhere("session.author = :author")
			->setParameter("since", $since->setTime(0, 0))
			->setParameter("author", $member)
			->groupBy("tea.family", "group");

		switch ($query->interval) {
			case "month":
				$statQuery->addSelect("DATE_TRUNC('month', session.drankAt) as group");
				break;
			case "day":
				$statQuery->addSelect("DATE_TRUNC('day', session.drankAt) as group");
				break;
			default:
				$statQuery->addSelect("DATE_TRUNC('week', session.drankAt) as group");
		}

		$groupedStats = array_filter($statQuery->getQuery()->getResult(), fn($el) => $el["group"]);
		$groupedStats = array_map(
			fn($group) => Arr::pluck(Arr::keyBy($group, fn($e) => $e["family"]->value), "total"),
			Arr::groupBy($groupedStats, fn($el) => substr($el["group"], 0, 10)),
		);

		return $this->json($groupedStats);
	}
}
