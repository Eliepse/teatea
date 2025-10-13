<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251012141910 extends AbstractMigration
{
	public function getDescription(): string
	{
		return "Add session's brewing quality";
	}

	public function up(Schema $schema): void
	{
		$this->addSql('ALTER TABLE tea_session ADD quality INT DEFAULT NULL');
	}

	public function down(Schema $schema): void
	{
		// Learn from the past, but don't be stuck in it
	}
}
