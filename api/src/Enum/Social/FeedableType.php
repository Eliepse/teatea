<?php

namespace App\Enum\Social;

enum FeedableType: int
{
	case Post = 10;
	case TeaSession = 0;

	public function toString(): string
	{
		return match ($this) {
			FeedableType::Post => "post",
			FeedableType::TeaSession => "tea_session",
		};
	}

	public static function cast(mixed $value): ?FeedableType
	{
		if (is_numeric($value)) {
			return FeedableType::tryFrom(intval($value));
		}

		return match ($value) {
			"post" => FeedableType::Post,
			"tea_session" => FeedableType::TeaSession,
			default => null,
		};
	}
}
