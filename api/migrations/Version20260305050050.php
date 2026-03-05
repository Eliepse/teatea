<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260305050050 extends AbstractMigration
{
	public function getDescription(): string
	{
		return 'Change session\'s drankAt to date instead of datetime with timezone';
	}

	public function up(Schema $schema): void
	{
		$this->addSql('ALTER TABLE tea_session ALTER drank_at TYPE DATE');
	}
}
