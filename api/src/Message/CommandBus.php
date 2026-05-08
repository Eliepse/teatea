<?php

namespace App\Message;

use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class CommandBus
{
	use HandleTrait;

	public function __construct(
		MessageBusInterface $commandBus,
	) {
		$this->messageBus = $commandBus;
	}

	public function process(object $command): mixed
	{
		return $this->handle($command);
	}
}
