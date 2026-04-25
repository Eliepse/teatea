<?php

declare(strict_types=1);

namespace App\Controller\Friendship;

use App\Entity\Pivot\FriendshipRequest;
use App\Entity\User;
use App\Exception\FriendRequestAlreadySentException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Doctrine\Attribute\MapEntity;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route(
	'/api/members/{username}/friends/request',
	methods: ["POST"],
)]
#[IsGranted("IS_AUTHENTICATED")]
class RequestFriendshipController extends AbstractController
{
	public function __invoke(
		#[MapEntity(mapping: ["username" => "username"])]
		User $target,
		Security $security,
		EntityManagerInterface $em,
	): JsonResponse {
		$requestor = $security->getUser();
		assert($requestor instanceof User);

		if($requestor->username === $target->username) {
			throw new BadRequestHttpException("Cannot be freind to self ");
		}

		if (null !== $target->findFriendship($requestor)) {
			throw new BadRequestHttpException("Request already sent");
		}

		$friendship = new FriendshipRequest($requestor, $target);

		$em->persist($friendship);
		$em->flush();

		return $this->json([]);
	}
}
