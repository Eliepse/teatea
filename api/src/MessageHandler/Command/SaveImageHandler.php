<?php

namespace App\MessageHandler\Command;

use App\Entity\MediaObject;
use App\Message\Command\SaveImageCommand;
use App\MessageHandler\Contract\CommandHandlerInterface;
use App\Repository\MediaObjectRepository;
use App\State\MediaObject\ImageProcessor;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\EntityManagerInterface;

final readonly class SaveImageHandler implements CommandHandlerInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private MediaObjectRepository $mediaRepo,
		private ImageProcessor $imageProcessor,
	) {
	}

	/**
	 * @return Collection<MediaObject>
	 */
	public function __invoke(SaveImageCommand $cmd): Collection
	{
		$entities = [];

		// Create the media and associate the CollectionTea
		foreach ($cmd->images as $image) {
			$placeholder = $this->imageProcessor->process($image);

			$entity = new \App\Entity\MediaObject();
			$entity->file = $image;
			$entity->placeholder = $placeholder;
			$entity->attach($cmd->owner);

			$this->em->persist($entity);
			$entities[] = $entity;
		}

		if(null === $cmd->ownerMaxImages) {
			return new ArrayCollection($entities);
		}

		$mediaObjects = $this->mediaRepo->findByHasMedia($cmd->owner);
		$count = count($mediaObjects) + 1; // Add one to account for the one that will be created

		if($cmd->ownerMaxImages >= $count) {
			return new ArrayCollection($entities);
		}

		// Remove all existing instance
		$overflowingMedia = $mediaObjects->slice(0, $count - $cmd->ownerMaxImages);
		foreach ($overflowingMedia as $media) {
			$this->em->remove($media);
		}
		$this->em->flush();

		return new ArrayCollection($entities);
	}
}
