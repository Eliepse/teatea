<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251031152702 extends AbstractMigration
{
	public function getDescription(): string
	{
		return 'Add slug to tea types';
	}

	public function up(Schema $schema): void
	{
		$this->addSql('ALTER TABLE tea_type ADD slug TEXT NULL');
		$this->addSql('CREATE UNIQUE INDEX UNIQ_40C72F91A5E6215B989D9B62 ON tea_type (family, slug)');
		$this->addSql(
			"UPDATE tea_type SET slug=lower(concat(replace(unaccent(name), ' ', '-'), '-', id)) WHERE slug IS NULL",
		);
		$this->addSql('ALTER TABLE tea_type ALTER slug SET NOT NULL');
	}

	public function down(Schema $schema): void
	{
		// I don't want to rollback
	}
}
