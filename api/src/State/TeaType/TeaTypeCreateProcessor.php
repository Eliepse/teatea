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
		private Security $security,
	) {}

	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): TeaType
	{
		$user = $this->security->getUser();

		assert($data instanceof TeaType);
		assert($user instanceof User);

		$entity = new \App\Entity\TeaType();
		$entity->family = $data->family;
		$entity->name = trim($data->name);
		$entity->slug = new AsciiSlugger()
			->slug($entity->name)
			->lower()
			->toString();
		$entity->createdBy = $user;

		// Only define a precise origin

		$this->em->persist($entity);
		$this->em->flush();

		$data->name = $entity->name;
		$data->family = $entity->family;
		$data->slug = $entity->slug;
		return $data;
	}
}
