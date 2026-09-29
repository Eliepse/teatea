<?php

namespace App\State\Post;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Social\Post;
use App\Entity\Pivot\MediaObjectPivot;
use App\State\Hydration\ResourceHydrator;
use Doctrine\Common\Collections\ArrayCollection;
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
        /** @var \App\Entity\Social\Post|null $result */
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

        if (null === $result) {
            return null;
        }

        /** @var MediaObjectPivot[] $mediaPivots */
        $mediaPivots = $this->em
            ->createQuery(<<<DQL
				SELECT pivot, media
				FROM App\Entity\Pivot\MediaObjectPivot pivot
				LEFT JOIN pivot.media media
				WHERE pivot.mediableType = :type
				  AND pivot.mediableId = :id
				DQL,
            )
            ->setParameter("type", \App\Entity\Social\Post::class)
            ->setParameter("id", $result->id)
            ->getResult();

        foreach ($mediaPivots as $pivot) {
            $result->media ??= new ArrayCollection();
            $result->media->add($pivot->media);
        }

        /** @noinspection PhpIncompatibleReturnTypeInspection */
        return $this->hydrator->hydrate($result);
    }
}
