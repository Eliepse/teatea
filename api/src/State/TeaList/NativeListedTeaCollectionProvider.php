<?php

namespace App\State\TeaList;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\ListedTea;
use App\Entity\User;
use App\Enum\TeaListPivotType;
use App\Helper\Arr;
use App\Repository\OriginRepository;
use App\State\Tea\TeaProvider;
use App\State\TeaSession\TeaSessionProvider;
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * Native lists doesn't need to be linked to a list entity
 *
 * @implements ProviderInterface<ListedTea[]>
 */
readonly class NativeListedTeaCollectionProvider implements ProviderInterface
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

		$listedTeaQuery = $this->em->createQueryBuilder()
			->select("pivot", "tea")
			->from(\App\Entity\TeaListPivot::class, "pivot")
			->leftJoin("pivot.tea", "tea")
			->andWhere("pivot.author = :member")
			->andWhere("pivot.type = :type")
			->setParameter("member", $user)
			->setParameter("type", $listType);

		$entities = $listedTeaQuery->getQuery()->getResult();

		$origins = $this->originRepo->getWithAncestors(array_map(fn($e) => $e->tea->originId, $entities));
		$originsById = Arr::keyBy($origins, "id");
		$originMap = TeaProvider::originsToMap($origins);

		$results = [];

		foreach ($entities as $entity) {
			$resource = ListedTeaProvider::fromEntity($entity);

			$path = TeaProvider::getOriginPath($originMap, $originsById[$entity->tea->originId]);
			$resource->tea = TeaProvider::hydrateResource($entity->tea, $path);

			$results[] = $resource;
		}

		return $results;
	}
}
