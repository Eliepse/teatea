<?php

namespace App\Mail;

use Symfony\Component\Mime\Email;

class VerifyLoginMail extends Email
{
	public function __construct(string $otpLink)
	{
		parent::__construct();

		$this->getHeaders()
			->addTextHeader('templateId', 1)
			->addTextHeader('subject', "Confirm login to your teatea account")
			->addParameterizedHeader('params', 'params', [
				"OTPLink" => $otpLink,
//				"OTPReject" => "",
			]);

		$this->html(
			<<<HTML
			To login, please follow this link:<br/>
			<a href="$otpLink">$otpLink</a>
			HTML,
		);
	}
}
