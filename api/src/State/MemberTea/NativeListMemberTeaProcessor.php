<?php

namespace App\State\MemberTea;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\MemberTea;
use App\ApiResource\TeaList;
use App\Entity\User;
use App\Enum\TeaListPivotType;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * @implements ProviderInterface<MemberTea>
 */
readonly class NativeListMemberTeaProcessor implements ProcessorInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private Security $security,
	) {
	}

	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): MemberTea
	{
		assert($data instanceof MemberTea);

		$user = $this->security->getUser();
		assert($user instanceof User);

		$listType = $operation->getExtraProperties()["list"];
		assert($listType instanceof TeaListPivotType);

		$entity = new \App\Entity\TeaListPivot();
		$entity->type = $listType;
		$entity->author = $user;
		$entity->tea = $this->em->getReference(\App\Entity\Tea::class, $data->tea->id);

		// Check for duplicate
		$duplicate = $this->em->createQueryBuilder()
			->select("pivot.id")
			->from(\App\Entity\TeaListPivot::class, "pivot")
			->where("pivot.author = :author")
			->andWhere("pivot.type = :type")
			->andWhere("pivot.tea = :tea")
			->setParameter("author", $entity->author)
			->setParameter("type", $entity->type)
			->setParameter("tea", $entity->tea)
			->getQuery()
			->getOneOrNullResult(AbstractQuery::HYDRATE_SCALAR);

		if (false === empty($duplicate)) {
			throw new BadRequestHttpException("Already in favorites");
		}

		$this->em->persist($entity);
		$this->em->flush();

		$resource = MemberTeaProvider::fromEntity($entity);

		// Hydrate native list
		$resource->list = new TeaList();
		$resource->list->id = 0;
		$resource->list->name = $listType->name;
		$resource->list->slug = $listType->getSlug();
		$resource->list->owner = $resource->author;

		return $resource;
	}
}
