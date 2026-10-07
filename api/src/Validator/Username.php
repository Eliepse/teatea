<?php
declare(strict_types=1);

namespace App\Validator;

use Symfony\Component\Validator\Constraints\Regex;

/**
 * Check if the value is a valid username
 */
#[\Attribute]
class Username extends Regex
{
	public function __construct(
		?string $message = null,
		?string $htmlPattern = null,
		?bool $match = null,
		?callable $normalizer = null,
		?array $groups = null,
		mixed $payload = null
	) {
		parent::__construct("/^[\p{L}_]{2,16}$/", $message, $htmlPattern, $match, $normalizer, $groups, $payload);
	}

	public function validatedBy(): string
	{
		return parent::class . 'Validator';
	}
}
