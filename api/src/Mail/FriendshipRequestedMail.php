<?php

namespace App\Mail;

use Symfony\Component\Mime\Email;

class FriendshipRequestedMail extends Email
{
	public function __construct(string $requestorUsername, string $friendsPageUrl)
	{
		parent::__construct();

		$this->getHeaders()
			->addTextHeader('templateId', 3)
			->addParameterizedHeader('params', 'params', [
				"REQUESTOR_USERNAME" => $requestorUsername,
				"LINK" => $friendsPageUrl,
			]);

		$this->text(
			<<<TXT
			$requestorUsername would like to become you tea friend.
			Go to '$friendsPageUrl' to review and accept (or reject) the request
			TXT,
		);
	}
}
