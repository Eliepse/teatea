<?php

namespace App\State\Friendship;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\Friendship;
use App\Entity\Pivot\FriendshipRequest;
use App\Entity\User;
use App\Mail\FriendshipAcceptedMail;
use App\Repository\FriendshipRequestRepository;
use App\State\Hydration\FriendshipHydrator;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Mailer\MailerInterface;

readonly class DecideFriendshipRequestProcessor implements ProcessorInterface
{
	public function __construct(
		private Security $security,
		private EntityManagerInterface $em,
		private FriendshipRequestRepository $friendshipRepo,
		private FriendshipHydrator $hydrator,
		private MailerInterface $mailer,
		#[Autowire("%app.base_url%")]
		private string $baseUrl,
	) {
	}

	public function process(
		mixed $data,
		Operation $operation,
		array $uriVariables = [],
		array $context = [],
	): Friendship {
		$id = $uriVariables["id"];
		$user = $this->security->getUser();
		$request = $context["request"] ?? null;

		assert($user instanceof User);
		assert($request instanceof Request);

		$decision = $request->attributes->getString("decision");
		$entity = $this->friendshipRepo->find($id);

		if (null === $entity) {
			throw new NotFoundHttpException();
		}

		if (!$this->security->isGranted("FRIENDSHIP_DECISION", $entity)) {
			throw new AccessDeniedHttpException();
		}

		if ("accept" === $decision) {
			$target = $entity->target;
			$inverse = $this->friendshipRepo->findOneBy(["requestedBy" => $target, "target" => $entity->requestedBy]);
			$inverse ??= new FriendshipRequest($target, $entity->requestedBy);
			$entity->accept();
			$inverse->accept();
			$this->em->persist($inverse);

			$this->mailer->send(
				new FriendshipAcceptedMail($target->username, "$this->baseUrl/members/$target->username")
					->from("elie.meignan@eliepse.fr")
					->to($target->email),
			);
		} elseif ("reject" === $decision) {
			$entity->reject();
		} else {
			throw new BadRequestHttpException("Invalid decision: $decision");
		}

		$this->em->flush();

		return $this->hydrator->hydrate($entity);
	}
}
