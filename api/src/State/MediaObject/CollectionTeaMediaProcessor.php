<?php

namespace App\State\MediaObject;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\MediaObject;
use App\Media\ResizeType;
use App\Media\WebpEncoder;
use App\Repository\MediaObjectRepository;
use App\ValueObject\Size;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Process\Process;
use Vich\UploaderBundle\Storage\StorageInterface;

readonly class CollectionTeaMediaProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private MediaObjectRepository $mediaRepo,
		private StorageInterface $storage,
		#[Autowire("%app.base_url%")]
		private string $baseUrl,
		private LoggerInterface $logger,
	) {}

	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): ?MediaObject
	{
		assert($data instanceof MediaObject);
		$username = $uriVariables["username"] ?? null;
		$id = $uriVariables["id"] ?? null;

		if (empty($username) || empty($id)) {
			throw new NotFoundHttpException();
		}

		/** @var \App\Entity\CollectionTea|null $teaEntity */
		$cteaEntity = $this->em
			->createQuery(<<<DQL
				SELECT collection_tea
				FROM App\Entity\CollectionTea collection_tea
					INNER JOIN collection_tea.owner owner WITH owner.username = :username
				WHERE collection_tea.id = :id
				DQL)
			->setParameter("id", $id)
			->setParameter("username", $username)
			->getOneOrNullResult();

		if (empty($cteaEntity)) {
			throw new NotFoundHttpException();
		}

		/**
		 * Rotate and optimize image
		 */

		try {
			$exif = @exif_read_data($data->file->getPathname(), null) ?: [];

			if (in_array($exif["Orientation"], [3, 5, 6, 7, 8], true)) {
				$this->makeAutorotateProcess($data->file)->mustRun();
			}
		} catch (\Throwable $e) {
			$this->logger->error("Failed to autorotate the image: " . $e->getMessage());
		}

		$this->makeOptimizationEncoder()->toFile($data->file, $data->file);
		$placeholder = $this->makePlaceholderEncoder()->toBase64($data->file);

		/**
		 * Persist media
		 */

		$mediaObjects = $this->mediaRepo->findByHasMedia($cteaEntity);

		// Create the media and associate the CollectionTea
		$entity = new \App\Entity\MediaObject();
		$entity->file = $data->file;
		$entity->placeholder = $placeholder;
		$entity->attach($cteaEntity);

		$this->em->persist($entity);

		// Remove all existing instance (only one image allowed)
		foreach ($mediaObjects as $media) {
			$this->em->remove($media);
		}

		$this->em->flush();

		$data->id = $entity->id;
		$data->contentUrl = $this->baseUrl . $this->storage->resolveUri($entity, "file");
		return $data;
	}

	private function makeOptimizationEncoder(): WebpEncoder
	{
		return new WebpEncoder(
			resize: new Size(2000, 1500),
			resizeType: ResizeType::Contain,
			noUpscaling: true,
			keepAlpha: false,
			stripMetadata: true,
			quality: 70,
			compressionQuality: 4,
		);
	}

	private function makePlaceholderEncoder(): WebpEncoder
	{
		return new WebpEncoder(
			resize: new Size(3, 3),
			keepAlpha: false,
			stripMetadata: true,
			quality: 25,
			compressionQuality: 6,
		);
	}

	/**
	 * Autorotate the given image with ImageMagick by reading the Exif "Orientation"
	 */
	private function makeAutorotateProcess(File $file): Process
	{
		return new Process([
			"convert",
			"-auto-orient",
			"-limit",
			"memory",
			"16MiB",
			"-format",
			"jpg",
			$file->getPathname(),
			$file->getPathname(),
		]);
	}
}
