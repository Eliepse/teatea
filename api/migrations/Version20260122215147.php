<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260122215147 extends AbstractMigration
{
	public function getDescription(): string
	{
		return 'Remove origin and origin protection';
	}

	public function up(Schema $schema): void
	{
		$this->addSql('ALTER TABLE tea_type DROP CONSTRAINT fk_40c72f9156a273cc');
		$this->addSql('DROP INDEX idx_40c72f9156a273cc');
		$this->addSql('ALTER TABLE tea_type DROP origin_id');
		$this->addSql('ALTER TABLE tea_type DROP is_protected_origin');
	}

	public function down(Schema $schema): void
	{
		// Trust me, you'll only find troubles going this path
	}
}
