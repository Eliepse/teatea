<?php

namespace App\State\MemberTea;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\MemberTea;
use App\ApiResource\TeaList;
use App\Entity\User;
use App\Enum\TeaListPivotType;
use App\Helper\Arr;
use App\Helper\OperationHelper;
use App\Repository\OriginRepository;
use App\State\Tea\TeaProvider;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * Native lists doesn't need to be linked to a list entity
 *
 * @implements ProviderInterface<MemberTea[]>
 */
readonly class NativeListMemberTeaCollectionProvider implements ProviderInterface
{
	public function __construct(
		private EntityManagerInterface $em,
		private OriginRepository $originRepo,
		private Security $security,
	) {
	}

	public function provide(Operation $operation, array $uriVariables = [], array $context = []): array
	{
		assert($operation instanceof CollectionOperationInterface, "Only supports collection operations");

		$user = $this->security->getUser();
		assert($user instanceof User);

		$listType = $operation->getExtraProperties()["list"];
		assert($listType instanceof TeaListPivotType);

		$teaSearch = OperationHelper::getParameter($operation, "tea");

		$listedTeaQuery = $this->em->createQueryBuilder()
			->select("pivot", "tea")
			->from(\App\Entity\TeaListPivot::class, "pivot")
			->leftJoin("pivot.tea", "tea")
			->andWhere("pivot.author = :member")
			->andWhere("pivot.type = :type")
			->setParameter("member", $user)
			->setParameter("type", $listType);

		if (is_int($teaSearch)) {
			$listedTeaQuery->andWhere("pivot.tea = :tea")->setParameter("tea", $teaSearch);
		}

		$entities = $listedTeaQuery->getQuery()->getResult();

		$origins = $this->originRepo->getWithAncestors(array_map(fn($e) => $e->tea->originId, $entities));
		$originsById = Arr::keyBy($origins, "id");
		$originMap = TeaProvider::originsToMap($origins);

		$results = [];

		// Hydrate native list
		$list = new TeaList();
		$list->id = 0;
		$list->name = $listType->name;
		$list->slug = $listType->getSlug();

		foreach ($entities as $entity) {
			$resource = MemberTeaProvider::fromEntity($entity);

			$path = $entity->tea->originId ? TeaProvider::getOriginPath(
				$originMap,
				$originsById[$entity->tea->originId],
			) : null;
			$resource->tea = TeaProvider::hydrateResource($entity->tea, $path);
			$resource->list = $list;
			$resource->list->owner = $resource->author;

			$results[] = $resource;
		}

		return $results;
	}
}
