<?php

namespace App\Helper;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ParameterNotFound;

final class OperationHelper
{
	public static function getParameter(Operation $operation, string $key): string|int|array|float|null
	{
		$parameter = $operation->getParameters()?->get($key);

		if (null === $parameter) {
			return null;
		}

		$value = $parameter->getValue();
		return $value instanceof ParameterNotFound ? null : $value;
	}
}
