<?php

namespace App\Message;

use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class QueryBus
{
	use HandleTrait;

	public function __construct(
		MessageBusInterface $queryBus,
	) {
		$this->messageBus = $queryBus;
	}

	public function ask(object $query): mixed
	{
		return $this->handle($query);
	}
}
