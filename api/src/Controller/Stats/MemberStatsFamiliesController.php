<?php

declare(strict_types=1);

namespace App\Controller\Stats;

use App\DTO\Request\Stats\MemberStatsFamiliesQueryString;
use App\Entity\Tea;
use App\Entity\User;
use App\Helper\Arr;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Doctrine\Attribute\MapEntity;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapQueryString;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/members/{username}/stats/families')]
class MemberStatsFamiliesController extends AbstractController
{
	public function __invoke(
		#[MapEntity(mapping: ["username" => "username"])]
		User $member,
		#[MapQueryString]
		MemberStatsFamiliesQueryString $query,
		EntityManagerInterface $em,
	): JsonResponse {
		$statQuery = $em->createQueryBuilder()
			->select("tea.family", "count(session) as total")
			->from(Tea::class, "tea")
			->leftJoin("tea.sessions", "session")
			->where("session.author = :author")
			->setParameter("author", $member)
			->groupBy("tea.family");

		if (null !== $query->since) {
			$statQuery->andWhere("session.drankAt >= :since")->setParameter("since", $query->since->setTime(0, 0));
		}

		$rowByFamily = Arr::keyBy($statQuery->getQuery()->getResult(), fn($d) => $d["family"]->value);
		return $this->json(Arr::pluck($rowByFamily, "total"));
	}
}
