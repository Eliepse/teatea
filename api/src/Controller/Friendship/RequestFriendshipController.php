<?php

declare(strict_types=1);

namespace App\Controller\Friendship;

use App\Entity\Pivot\FriendshipRequest;
use App\Entity\User;
use App\Mail\FriendshipAcceptedMail;
use App\Mail\FriendshipRequestedMail;
use App\Repository\FriendshipRequestRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Doctrine\Attribute\MapEntity;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
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
		FriendshipRequestRepository $friendshipRepo,
		MailerInterface $mailer,
		UrlGeneratorInterface $urlGenerator,
		#[Autowire("%app.base_url%")]
		string $baseUrl,
	): JsonResponse {
		$requestor = $security->getUser();
		assert($requestor instanceof User);

		if ($requestor->username === $target->username) {
			throw new BadRequestHttpException("Cannot be freind to self ");
		}

		$friendship = $friendshipRepo->findOneBy(["target" => $target, "requestedBy" => $requestor]);

		if (null !== $friendship) {
			throw new BadRequestHttpException("Request already sent");
		}

		$friendship = new FriendshipRequest($requestor, $target);
		$em->persist($friendship);

		// Opposite side already sent a request, so it means both are willing
		// to connect and we can skip confirmation (accept both sides)
		$inverse = $friendshipRepo->findOneBy(["target" => $requestor, "requestedBy" => $target]);
		if (null !== $inverse && false === $inverse->decided()) {
			$inverse->accept();
			$friendship->accept();

			$mailer->send(
				new FriendshipAcceptedMail($target->username, "$baseUrl/members/$target->username")
					->from("elie.meignan@eliepse.fr")
					->to($target->email),
			);

			$em->flush();
			return $this->json([]);
		}

		$mailer->send(
			new FriendshipRequestedMail($requestor->username, "$baseUrl/members/$target->username/friends")
				->from("elie.meignan@eliepse.fr")
				->to($target->email),
		);

		$em->flush();
		return $this->json([]);
	}
}
