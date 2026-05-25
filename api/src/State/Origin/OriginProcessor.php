<?php

namespace App\State\Origin;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Origin;
use App\Doctrine\DBAL\Types\ValueObject\LTreePath;
use App\Entity\User;
use App\Message\Command\AddOriginCommand;
use App\Message\CommandBus;
use App\Repository\OriginRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

use function Symfony\Component\String\u;

/**
 * @implements ProviderInterface<Origin|null>
 */
readonly class OriginProcessor implements ProcessorInterface
{
	public function __construct(
		private Security $security,
		private CommandBus $commandBus,
	) {}

	public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Origin
	{
		assert($data instanceof Origin);

		$user = $this->security->getUser();
		assert($user instanceof User);

		$entity = $this->commandBus->process(new AddOriginCommand($data->name, $data->parentPath, $user->id));

		$resource = OriginProvider::fromEntity($entity);
		$resource->isLeaf = true;
		return $resource;
	}
}
