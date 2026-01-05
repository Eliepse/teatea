<?php

namespace App\Repository;

use App\Doctrine\HasMedia;
use App\Entity\MediaObject;
use App\Entity\Pivot\MediaObjectPivot;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<MediaObject>
 */
class MediaObjectRepository extends ServiceEntityRepository
{
	public function __construct(ManagerRegistry $registry)
	{
		parent::__construct($registry, MediaObject::class);
	}

	public function findByHasMedia(HasMedia $mediable): Collection
	{
		/** @var MediaObject[] $associatedMedia */
		$associatedMedia = $this->createQueryBuilder("media")
			->addSelect("pivots")
			->innerJoin("media.pivots", "pivots")
			->andWhere("pivots.mediableType = :mediableType AND pivots.mediableId = :mediableId")
			->setParameter("mediableType", $mediable->getType())
			->setParameter("mediableId", $mediable->getId())
			->getQuery()
			->getResult();

		// Hydrate mediable to pivots
		foreach ($associatedMedia as $media) {
			/** @var MediaObjectPivot $pivot */
			foreach ($media->pivots as $pivot) {
				$pivot->setMediable($mediable);
			}
		}

		return new ArrayCollection($associatedMedia);
	}
}
