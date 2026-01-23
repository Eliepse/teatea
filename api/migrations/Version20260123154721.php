<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260123154721 extends AbstractMigration
{
	public function getDescription(): string
	{
		return '';
	}

	public function up(Schema $schema): void
	{
		$this->addSql('DROP INDEX uniq_def1561eb548b0f');
		$this->addSql('DROP INDEX idx_8e86d7b256a273cc');
		$this->addSql('ALTER TABLE tea DROP CONSTRAINT fk_8e86d7b256a273cc');
		$this->addSql('ALTER TABLE origin DROP CONSTRAINT origin_pkey');
		$this->addSql('ALTER TABLE origin DROP id');
		$this->addSql('ALTER TABLE origin ADD PRIMARY KEY (path)');
		$this->addSql('ALTER TABLE tea DROP origin_id');
		$this->addSql(
			'ALTER TABLE tea ADD CONSTRAINT FK_8E86D7B2CC7A73FF FOREIGN KEY (origin_path) REFERENCES origin (path) NOT DEFERRABLE',
		);
		$this->addSql('CREATE INDEX IDX_8E86D7B2CC7A73FF ON tea (origin_path)');
	}

	public function down(Schema $schema): void
	{
		// Cleaning is great
	}
}
