<?php

namespace App\State\TeaType;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\TeaType;
use App\Entity\Origin;
use App\Entity\User;
use App\Repository\OriginRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\String\Slugger\AsciiSlugger;

readonly class TeaTypeCreateProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private OriginRepository $originRepo,
		private Security $security,
	) {
	}

	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): TeaType
	{
		$user = $this->security->getUser();

		assert($data instanceof TeaType);
		assert($user instanceof User);

		$entity = new \App\Entity\TeaType();
		$entity->family = $data->family;
		$entity->name = trim($data->name);
		$entity->slug = new AsciiSlugger()->slug($entity->name)->lower()->toString();
		$entity->createdBy = $user;

		$origin = $this->originRepo->byPath($data->origin->path);
		assert($origin instanceof Origin);

		$entity->isProtectedOrigin = $data->isPDO;
		$entity->origin = $origin;

		// Only define a precise origin

		$this->em->persist($entity);
		$this->em->flush();

		$data->id = $entity->id;
		$data->name = $entity->name;
		$data->family = $entity->family;
		$data->origin = new \App\ApiResource\Origin();
		$data->origin->path = $entity->origin->path;
		$data->origin->name = $entity->origin->name;
		return $data;
	}
}
