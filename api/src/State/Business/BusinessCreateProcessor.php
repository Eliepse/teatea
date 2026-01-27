<?php

namespace App\State\Business;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\Business;
use App\Entity\User;
use App\State\Cultivar\CultivarProvider;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

readonly class BusinessCreateProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
	) {}

	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Business
	{
		$user = $this->security->getUser();

		assert($data instanceof Business);
		assert($user instanceof User);

		// Remove extra spaces
		$refinedName = trim(preg_replace("/\s+/", " ", $data->name));

		$exitingIds = $this->em
			->createQuery("SELECT c.id FROM App\Entity\Business c WHERE lower(unaccent(c.name)) = lower(unaccent(:name))")
			->setParameter("name", $refinedName)
			->getScalarResult();

		if (false === empty($exitingIds)) {
			throw new BadRequestHttpException("A business with the same name already exists");
		}

		$entity = new \App\Entity\Business();
		$entity->name = trim($data->name);
		$entity->author = $user;
		$this->em->persist($entity);
		$this->em->flush();

		return BusinessProvider::fromEntity($entity);
	}
}
