<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;


final class Version20260130113056 extends AbstractMigration
{
	public function getDescription(): string
	{
		return 'Add finished date to collection tea';
	}

	public function up(Schema $schema): void
	{
		$this->addSql('ALTER TABLE collection_tea ADD finished_at DATE DEFAULT NULL');
		$this->addSql('ALTER TABLE tea DROP origin_id');
	}
}
