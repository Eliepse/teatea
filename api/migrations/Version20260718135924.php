<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260718135924 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add feed view and indexes for feed queries optimizations';
    }

    public function up(Schema $schema): void
    {
		$this->addSql(
			<<<SQL
			CREATE INDEX tea_session_timeline ON tea_session (drank_at DESC, id DESC);
			SQL
		);

		$this->addSql(
			<<<SQL
			CREATE INDEX post_timeline ON post (created_at DESC, id DESC);
			SQL
		);

        $this->addSql(
			<<<SQL
			CREATE VIEW feed AS
			(
				(
				    SELECT
				        post.id,
				        10 as type,
				        post.created_at as published_at
				    FROM post
				    ORDER BY post.created_at DESC
				)
				UNION
				(
				    SELECT
				        tea_session.id,
				        0 as type,
				        tea_session.drank_at as published_at
				    FROM tea_session
				    ORDER BY tea_session.created_at DESC
				)
				ORDER BY published_at DESC, type DESC, id DESC
			);
			SQL

        );
    }
}
