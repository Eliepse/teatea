<?php

namespace App\State\Post;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\Pagination\Pagination;
use ApiPlatform\State\Pagination\PaginatorInterface;
use ApiPlatform\State\Pagination\TraversablePaginator;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Social\Post;
use App\State\Hydration\PostHydrator;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @implements ProviderInterface<PaginatorInterface<Post>|null>
 */
readonly class PostPaginatedProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Pagination $pagination,
		private PostHydrator $postHydrator,
	) {}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): PaginatorInterface
	{
		assert($operation instanceof CollectionOperationInterface);

		$page = $this->pagination->getPage($context);
		$pageSize = $this->pagination->getLimit($operation, $context);

		$search = $this->em->createQueryBuilder()->from(\App\Entity\Social\Post::class, "post");

		$total = (clone $search)->select("COUNT(post)")->resetDQLPart("orderBy")->getQuery()->getSingleScalarResult();

		if (0 === $total) {
			return new TraversablePaginator(new ArrayCollection(), $page, $pageSize, $total);
		}

		$results = $search
			->select("post")
			->setFirstResult($this->pagination->getOffset($operation, $context))
			->setMaxResults($pageSize)
			->orderBy("post.createdAt", "DESC")
			->getQuery()
			->getResult();

		$resources = array_map(fn($e) => $this->postHydrator->hydrate($e), $results);
		return new TraversablePaginator(new ArrayCollection($resources), $page, $pageSize, $total);
	}
}
