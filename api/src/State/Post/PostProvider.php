<?php

namespace App\State\Post;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Social\Post;
use App\State\Hydration\ResourceHydrator;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @implements ProviderInterface<Post|null>
 */
readonly class PostProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private ResourceHydrator $hydrator,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): ?Post
	{
		$result = $this->em->createQuery(
			<<<DQL
			SELECT post, author
			FROM App\Entity\Social\Post post
			LEFT JOIN post.author author
			WHERE post.id = :id
			DQL,
		)
			->setParameter("id", $uriVariables["id"])
			->getOneOrNullResult();

		/** @noinspection PhpIncompatibleReturnTypeInspection */
		return $this->hydrator->hydrate($result);
	}
}
