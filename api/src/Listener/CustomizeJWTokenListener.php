<?php

namespace App\Listener;

use App\Entity\User;
use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTCreatedEvent;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

final class CustomizeJWTokenListener
{
	#[AsEventListener("lexik_jwt_authentication.on_jwt_created")]
	public function onJWTCreated(JWTCreatedEvent $event): void
	{
		$user = $event->getUser();
		assert($user instanceof User);

		$event->setData(array_replace($event->getData(), ["username" => $user->username]));
	}
}
