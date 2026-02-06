<?php

namespace App\DTO\Request\Stats;

use Symfony\Component\Validator\Constraints as Assert;

class MemberFamiliesStatsQueryString
{
	#[Assert\Choice(choices: ["month", "week", "day"])]
	public string $interval = "week";

	#[Assert\GreaterThanOrEqual("12 months ago")]
	public ?\DateTimeImmutable $since = null;
}
