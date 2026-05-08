<?php

namespace App\MessageHandler\Query;

use App\Message\Query\FindTypeFamilyQuery;
use App\MessageHandler\Contract\QueryHandlerInterface;
use App\Repository\TeaTypeRepository;

final readonly class FindTypeFamilyHandler implements QueryHandlerInterface
{
	public function __construct(
		private TeaTypeRepository $repo,
	) {
	}

	public function __invoke(FindTypeFamilyQuery $query): \App\Entity\TeaType
	{
		$families = $this->repo->getFamilies();
		$type = $families[$query->family->value] ?? null;

		if (null === $type) {
			throw new \RuntimeException("Unable to find the type for the '{$query->family->value}' family");
		}

		return $type;
	}
}
