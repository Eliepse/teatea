<?php

namespace App\State\TeaList;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\TeaList;
use App\Entity\User;
use App\Enum\TeaListPivotType;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\String\UnicodeString;

/**
 * @implements ProviderInterface<TeaList|null>
 */
readonly class TeaListProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
	) {
	}

	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): TeaList
	{
		$user = $this->security->getUser();
		assert($data instanceof TeaList);
		assert($user instanceof User);

		$entity = new \App\Entity\TeaList();
		$entity->type = $data->type;
		$entity->owner = $user;
		$entity->slug = trim(new UnicodeString($data->name)->trim()->ascii()->kebab()->toString(), "_");

		// Check for duplicate
		$duplicate = $this->em->createQueryBuilder()
			->select("list.id")
			->from(\App\Entity\TeaList::class, "list")
			->where("list.owner = :owner AND list.slug = :slug")
			->setParameter("owner", $entity->owner)
			->setParameter("slug", $entity->slug)
			->getQuery()
			->getOneOrNullResult(AbstractQuery::HYDRATE_SCALAR);

		if (false === empty($duplicate)) {
			throw new BadRequestHttpException("Similar list already exists");
		}

		$this->em->persist($entity);
		$this->em->flush();

		return TeaListProvider::fromEntity($entity);
	}
}
