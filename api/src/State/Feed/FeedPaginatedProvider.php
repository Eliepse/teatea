<?php

namespace App\State\Feed;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\Pagination\Pagination;
use ApiPlatform\State\Pagination\PaginatorInterface;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Social\Feed;
use App\ApiResource\Social\Post;
use App\ApiResource\TeaSession;
use App\Entity\CollectionTea;
use App\Entity\Pivot\MediaObjectPivot;
use App\Enum\Social\FeedableType;
use App\Helper\Arr;
use App\State\Hydration\ResourceHydrator;
use App\State\Pagination\CursorPaginator;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @implements ProviderInterface<PaginatorInterface<Post|TeaSession>>
 */
final readonly class FeedPaginatedProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Pagination $pagination,
		private ResourceHydrator $hydrator,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): object
	{
		assert($operation instanceof CollectionOperationInterface);
		$pageSize = $this->pagination->getLimit($operation, $context);
		$cursor = FeedCursor::decode($context["filters"]["cursor"]["lt"] ?? null);

		$searchQB = $this->em->getConnection()->createQueryBuilder()
			->select("id", "type", "published_at")
			->from("feed")
			->setMaxResults($pageSize);

		if (null !== $cursor) {
			$searchQB->where("(published_at, type, id) < (:publishedAt, :type, :id)")
				->setParameter("publishedAt", $cursor->publishedAt, Types::DATETIME_IMMUTABLE)
				->setParameter("type", $cursor->itemType->value)
				->setParameter("id", $cursor->itemId);
		}

		/** @var array<array{type: FeedableType, id: int, published_at: string}> $results */
		$results = array_map(
			fn($item) => [
				...$item,
				"type" => FeedableType::from($item["type"]),
			],
			$searchQB->fetchAllAssociative(),
		);

		$postIds = Arr::pluck(array_filter($results, fn($row) => $row["type"] === FeedableType::Post), "id");
		$sessionIds = Arr::pluck(array_filter($results, fn($row) => $row["type"] === FeedableType::TeaSession), "id");

		$postsById = $this->em
			->createQuery("SELECT post FROM App\Entity\Social\Post post WHERE post.id IN (:ids)")
			->setParameter("ids", $postIds, ArrayParameterType::INTEGER)
			->getResult();
		$postsById = Arr::keyBy($postsById, "id");

		/** @var MediaObjectPivot[] $mediaPivots */
		$mediaPivots = $this->em
			->createQuery(<<<DQL
				SELECT pivot, media
				FROM App\Entity\Pivot\MediaObjectPivot pivot
				LEFT JOIN pivot.media media
				WHERE pivot.mediableType = :type
				  AND pivot.mediableId IN (:ids)
				DQL)
			->setParameter("type", \App\Entity\Social\Post::class)
			->setParameter("ids", array_keys($postsById), ArrayParameterType::INTEGER)
			->getResult();

		foreach ($mediaPivots as $pivot) {
			$parent = $postsById[$pivot->mediableId] ?? null;

			if (null === $parent) {
				continue;
			}

			$parent->media ??= new ArrayCollection();
			$parent->media->add($pivot->media);
		}

		$sessionsById = $this->em
			->createQuery(
				<<<DQL
				SELECT session, tea, tea_type, business, author
				FROM App\Entity\TeaSession session
				LEFT JOIN session.tea tea
				LEFT JOIN session.author author
				LEFT JOIN tea.type tea_type
				LEFT JOIN tea.business business
				WHERE session.id IN (:ids)
				DQL,
			)
			->setParameter("ids", $sessionIds, ArrayParameterType::INTEGER)
			->getResult();
		$sessionsById = Arr::keyBy($sessionsById, "id");

		$resources = [];

		foreach ($results as $result) {
			$item = match ($result["type"]) {
				FeedableType::Post => $this->hydrator->hydrate($postsById[$result["id"]]),
				FeedableType::TeaSession => $this->hydrator->hydrate($sessionsById[$result["id"]]),
			};

			$resources[] = new Feed(FeedCursor::fromFeedable($item), $item);
		}

		return new CursorPaginator($resources, $pageSize);
	}
}
