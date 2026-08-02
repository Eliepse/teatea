<?php

namespace App\State\MediaObject;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\MediaObject;
use App\Message\Command\SaveImageCommand;
use App\Message\CommandBus;
use App\ValueObject\FileArray;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Vich\UploaderBundle\Storage\StorageInterface;

readonly class CollectionTeaMediaProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private StorageInterface $storage,
		#[Autowire("%app.base_url%")]
		private string $baseUrl,
		private CommandBus $commandBus,
	) {
	}

	public function process(
		mixed $data,
		Operation $operation,
		array $uriVariables = [],
		array $context = [],
	): ?MediaObject {
		assert($data instanceof MediaObject);
		$username = $uriVariables["username"] ?? null;
		$id = $uriVariables["id"] ?? null;

		if (empty($username) || empty($id)) {
			throw new NotFoundHttpException();
		}

		/** @var \App\Entity\CollectionTea|null $teaEntity */
		$cteaEntity = $this->em
			->createQuery(
				<<<DQL
				SELECT collection_tea
				FROM App\Entity\CollectionTea collection_tea
					INNER JOIN collection_tea.owner owner WITH owner.username = :username
				WHERE collection_tea.id = :id
				DQL,
			)
			->setParameter("id", $id)
			->setParameter("username", $username)
			->getOneOrNullResult();

		if (empty($cteaEntity)) {
			throw new NotFoundHttpException();
		}

		$medias = $this->commandBus->process(
			new SaveImageCommand($cteaEntity, new FileArray([$data->file]), ownerMaxImages: 1),
		);
		$media = $medias[0] ?? throw new \RuntimeException("Failed to save the media");

		$data->id = $media->id;
		$data->contentUrl = $this->baseUrl . $this->storage->resolveUri($media, "file");
		return $data;
	}
}
