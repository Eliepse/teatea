<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260201131010 extends AbstractMigration
{
	public function getDescription(): string
	{
		return 'Add collection tea rating';
	}

	public function up(Schema $schema): void
	{
		$this->addSql('ALTER TABLE collection_tea ADD rating INT DEFAULT NULL');
	}
}
