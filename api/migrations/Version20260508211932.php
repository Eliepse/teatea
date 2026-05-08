<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260508211932 extends AbstractMigration
{
	public function getDescription(): string
	{
		return 'Remove direct relation between Business and TeaSession';
	}

	public function up(Schema $schema): void
	{
		$this->addSql('ALTER TABLE tea_session DROP CONSTRAINT fk_9884218eda6a219');
		$this->addSql('DROP INDEX idx_9884218eda6a219');
		$this->addSql('ALTER TABLE tea_session DROP place_id');
	}
}
