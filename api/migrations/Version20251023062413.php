<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251023062413 extends AbstractMigration
{
	public function getDescription(): string
	{
		return 'Add place for tea sessions';
	}

	public function up(Schema $schema): void
	{
		$this->addSql('ALTER TABLE tea_session ADD place_id INT DEFAULT NULL');
		$this->addSql(
			'ALTER TABLE tea_session ADD CONSTRAINT FK_9884218EDA6A219 FOREIGN KEY (place_id) REFERENCES business (id) NOT DEFERRABLE',
		);
		$this->addSql('CREATE INDEX IDX_9884218EDA6A219 ON tea_session (place_id)');
	}

	public function down(Schema $schema): void
	{
		// Playing with space and time is never a good idea
	}
}
