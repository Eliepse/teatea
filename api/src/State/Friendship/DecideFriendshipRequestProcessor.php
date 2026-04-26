<?php

namespace App\State\Friendship;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\Friendship;
use App\Entity\Pivot\FriendshipRequest;
use App\Entity\User;
use App\Repository\FriendshipRequestRepository;
use App\State\Hydration\FriendshipHydrator;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

readonly class DecideFriendshipRequestProcessor implements ProcessorInterface
{
	public function __construct(
		private Security $security,
		private EntityManagerInterface $em,
		private FriendshipRequestRepository $friendshipRepo,
		private FriendshipHydrator $hydrator,
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
			$inverse = $this->friendshipRepo->findOneBy([
				"requestedBy" => $entity->target,
				"target" => $entity->requestedBy,
			]);
			$inverse ??= new FriendshipRequest($entity->target, $entity->requestedBy);
			$entity->accept();
			$inverse->accept();
			$this->em->persist($inverse);
		} elseif ("reject" === $decision) {
			$entity->reject();
		} else {
			throw new BadRequestHttpException("Invalid decision: $decision");
		}

		$this->em->flush();

		return $this->hydrator->hydrate($entity);
	}
}
