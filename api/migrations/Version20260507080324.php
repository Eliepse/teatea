<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;


final class Version20260507080324 extends AbstractMigration
{
	public function getDescription(): string
	{
		return 'Correct schema';
	}

	public function up(Schema $schema): void
	{
		$this->addSql('ALTER INDEX idx_6cc48ee14da1e751 RENAME TO IDX_7234A45F4DA1E751');
		$this->addSql('ALTER INDEX idx_6cc48ee1158e0b66 RENAME TO IDX_7234A45F158E0B66');
		$this->addSql('ALTER INDEX uniq_6cc48ee14da1e751158e0b66 RENAME TO UNIQ_7234A45F4DA1E751158E0B66');
	}

	public function down(Schema $schema): void
	{
		//
	}
}
