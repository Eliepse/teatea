<?php

namespace App\Helper;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ParameterNotFound;

final class OperationHelper
{
	/**
	 * Return the operation parameters, or null if it's missing (or empty)
	 */
	public static function getParameter(
		Operation $operation,
		string $key,
		bool $castEmptyToNull = true,
		?callable $castFn = null,
	): string|int|array|float|null|bool {
		$parameter = $operation->getParameters()?->get($key);

		if (null === $parameter) {
			return null;
		}

		$value = $parameter->getValue();

		if ($value instanceof ParameterNotFound) {
			return null;
		}

		if($castEmptyToNull && empty($value)) {
			return null;
		}

		return $castFn ? $castFn($value) : $value;
	}
}
