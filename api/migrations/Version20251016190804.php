<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251016190804 extends AbstractMigration
{
	public function getDescription(): string
	{
		return 'Add harvest year to teas';
	}

	public function up(Schema $schema): void
	{
		$this->addSql('ALTER TABLE tea ADD year INT DEFAULT NULL');
	}

	public function down(Schema $schema): void
	{
		// You can't go back in the past, only look back and learn
	}
}
