<?php

namespace App\State\Post;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\Social\Post;
use App\Entity\User;
use App\State\Hydration\ResourceHydrator;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\PropertyInfo\PropertyInfoExtractorInterface;

readonly class PostCreateProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
		private ResourceHydrator $hydrator,
	) {}

	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Post
	{
		$user = $this->security->getUser();

		assert($data instanceof Post);
		assert($user instanceof User);

		$entity = new \App\Entity\Social\Post();
		$entity->content = trim($data->content);
		$entity->author = $user;

		dd($data, $context);

		$this->em->persist($entity);
		$this->em->flush();

		/** @noinspection PhpIncompatibleReturnTypeInspection */
		return $this->hydrator->hydrate($entity);
	}
}
