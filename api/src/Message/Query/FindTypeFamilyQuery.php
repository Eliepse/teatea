<?php

namespace App\Message\Query;

use App\Enum\TeaFamily;

/**
 * Tea families also exists as dedicated TeaType to ease relations.
 * This query return the TeaType that correspond to the given family
 */
readonly class FindTypeFamilyQuery
{
	public function __construct(
		public TeaFamily $family,
	) {
	}
}
