<?php

namespace App\Mail;

use Symfony\Component\Mime\Email;

class FriendshipRequestedMail extends Email
{
	public function __construct(string $targetUsername, string $targetProfilePageUrl)
	{
		parent::__construct();

		$this->getHeaders()
			->addTextHeader('templateId', 3)
			->addParameterizedHeader('params', 'params', [
				"REQUESTOR_USERNAME" => $targetUsername,
				"LINK" => $targetProfilePageUrl,
			]);

		$this->text(
			<<<TXT
			$targetUsername would like to become you tea friend.
			Go to $targetProfilePageUrl to review and accept (or reject) the request
			TXT,
		);
	}
}
