<?php

namespace App\ApiResource\Social;

use App\ApiResource\Member;
use App\Enum\Social\FeedableType;


interface Feedable
{
    public function getId(): int;

    public function getType(): FeedableType;

    public function getPublishedAt(): \DateTimeImmutable;

    public function getAuthor(): ?Member;
}
