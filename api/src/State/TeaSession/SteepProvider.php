<?php

namespace App\State\TeaSession;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Steep;
use App\ApiResource\TeaSession;
use App\DTO\SteepValue;
use App\Entity\User;
use App\Repository\TeaSessionRepository;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

readonly class SteepProvider implements ProviderInterface
{
	public function __construct(
		private TeaSessionRepository $repo,
		private Security $security,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): Steep|null
	{
		$user = $this->security->getUser();
		assert($user instanceof User);

		/** @var \App\Entity\TeaSession|null $session */
		$session = $this->repo->find($uriVariables["sessionId"]);

		if (null === $session) {
			return null;
		}

		if ($user->id !== $session->author->id) {
			throw new AccessDeniedHttpException();
		}

		/** @var SteepValue|null $steep */
		$steep = array_find($session->getSteeps(), fn($steep) => $uriVariables["key"] === $steep->key);
		return null === $steep ? null : self::hydrate($steep, $session);
	}

	public static function hydrate(SteepValue $steep, \App\Entity\TeaSession $session): Steep
	{
		$resource = new Steep();
		$resource->key = $steep->key;
		$resource->duration = $steep->duration->seconds;
		$resource->temperature = $steep->temperature?->degrees;

		$resource->session = new TeaSession();
		$resource->session->id = $session->id;

		return $resource;
	}
}
