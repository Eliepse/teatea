<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250614202657 extends AbstractMigration
{
	public function getDescription(): string
	{
		return '';
	}

	public function up(Schema $schema): void
	{
		// this up() migration is auto-generated, please modify it to your needs
		$this->addSql('CREATE EXTENSION IF NOT EXISTS ltree');
		$this->addSql('ALTER TABLE origin ALTER path TYPE ltree USING path::ltree');
	}

	public function down(Schema $schema): void
	{
		// this down() migration is auto-generated, please modify it to your needs
		$this->addSql('DROP EXTENSION ltree');
		$this->addSql('ALTER TABLE origin ALTER path TYPE VARCHAR(255)');
	}
}
