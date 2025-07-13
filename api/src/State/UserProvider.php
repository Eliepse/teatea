<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\ActivityGraph;
use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * @implements ProviderInterface<ActivityGraph|null>
 */
readonly class UserProvider implements ProviderInterface
{
	public function __construct(private Security $security)
	{
	}

	public function provide(
		Operation $operation,
		array $uriVariables = [],
		array $context = [],
	): array|null|object {
		$user = $this->security->getUser();
		assert($user instanceof User);

		$resource = new \App\ApiResource\User();
		$resource->id = $user->id;
		$resource->username = $user->username;
		return $resource;
	}
}
