<?php

namespace App\DTO\Request\Stats;

use Symfony\Component\Validator\Constraints as Assert;

class MemberStatsFamiliesQueryString
{
	#[Assert\LessThanOrEqual("now")]
	public ?\DateTimeImmutable $since = null;
}
