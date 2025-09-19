<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250919092943 extends AbstractMigration
{
	public function getDescription(): string
	{
		return 'Change name of tea session steeps (previously brewing steps)';
	}

	public function up(Schema $schema): void
	{
		$this->addSql('ALTER TABLE tea_session RENAME COLUMN brewing_steps TO steeps');
	}

	public function down(Schema $schema): void
	{
		// The future is full of surprises
	}
}
