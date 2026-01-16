<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260116122122 extends AbstractMigration
{
	public function getDescription(): string
	{
		return 'Add predefined types for tea families';
	}

	public function up(Schema $schema): void
	{
		$this->addSql('ALTER TABLE tea_type ADD is_family BOOLEAN DEFAULT false NOT NULL');

		// Fetch an existing author
		$authorId = $this->connection->fetchOne(
			<<<SQL
			SELECT id FROM "user" WHERE to_jsonb(roles) ?? 'ROLE_ADMIN'
			SQL,
		);

		$this->addSql(
			<<<SQL
			INSERT INTO tea_type
			(family, name, origin_id, created_at, created_by, is_protected_origin, updated_at, slug, is_family)
			VALUES
			('white', 'White tea', null, current_date, :authorId, FALSE, current_date, 'white', TRUE),
			('yellow', 'Yellow tea', null, current_date, :authorId, FALSE, current_date, 'yellow', TRUE),
			('green', 'Green tea', null, current_date, :authorId, FALSE, current_date, 'green', TRUE),
			('wulong', 'Wulong tea', null, current_date, :authorId, FALSE, current_date, 'wulong', TRUE),
			('black', 'Black tea', null, current_date, :authorId, FALSE, current_date, 'black', TRUE),
			('fermented', 'Fermented tea', null, current_date, :authorId, FALSE, current_date, 'fermented', TRUE)
			SQL,
			["authorId" => $authorId],
		);
	}

	public function down(Schema $schema): void
	{
		// It's cruel to break families, same for tea families
	}
}
