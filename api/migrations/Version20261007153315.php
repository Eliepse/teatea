<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261007153315 extends AbstractMigration
{
	public function getDescription(): string
	{
		return 'Add author to feed view';
	}

	public function up(Schema $schema): void
	{
		$this->addSql(
			<<<SQL
			CREATE OR REPLACE VIEW feed AS
			(
				(
				    SELECT
				        post.id,
				        10 as type,
				        post.created_at as published_at,
				        post.author_id
				    FROM post
				    ORDER BY post.created_at DESC
				)
				UNION
				(
				    SELECT
				        tea_session.id,
				        0 as type,
				        tea_session.drank_at as published_at,
				        tea_session.author_id
				    FROM tea_session
				    ORDER BY tea_session.created_at DESC
				)
				ORDER BY published_at DESC, type DESC, id DESC
			);
			SQL
		);
	}
}
