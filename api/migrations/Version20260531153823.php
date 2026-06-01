<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260531153823 extends AbstractMigration
{
	public function getDescription(): string
	{
		return 'Allow tea to not have an origin';
	}

	public function up(Schema $schema): void
	{
		$this->addSql('ALTER TABLE tea ALTER origin_path DROP NOT NULL');
	}
}
