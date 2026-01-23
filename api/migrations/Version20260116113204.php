<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260116113204 extends AbstractMigration
{
	public function getDescription(): string
	{
		return 'Remove refresh_tokens';
	}

	public function up(Schema $schema): void
	{
		$this->addSql('DROP TABLE refresh_tokens');
	}

	public function down(Schema $schema): void
	{
		// A good thing its away, let's not have it back now
	}
}
