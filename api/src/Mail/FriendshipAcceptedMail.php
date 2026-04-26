<?php

namespace App\Mail;

use Symfony\Component\Mime\Email;

class FriendshipAcceptedMail extends Email
{
	public function __construct(string $targetUsername, string $targetProfilePageUrl)
	{
		parent::__construct();

		$this->getHeaders()
			->addTextHeader('templateId', 4)
			->addParameterizedHeader('params', 'params', [
				"TARGET_USERNAME" => $targetUsername,
				"LINK" => $targetProfilePageUrl,
			]);

		$this->text(
			<<<TXT
			$targetUsername has accepted to be your tea friend.
			Check you friend's profile at: $targetProfilePageUrl
			TXT,
		);
	}
}
