<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251024145642 extends AbstractMigration
{
	public function getDescription(): string
	{
		return 'Add support for inactive tokens and challenges tokens (that can validate other tokens)';
	}

	public function up(Schema $schema): void
	{
		$this->addSql('ALTER TABLE token ADD valid_from TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
		$this->addSql('ALTER TABLE token ADD challenge_for_id INT DEFAULT NULL');
		$this->addSql(
			'ALTER TABLE token ADD CONSTRAINT FK_5F37A13BDF867A8C FOREIGN KEY (challenge_for_id) REFERENCES token (id) ON DELETE CASCADE NOT DEFERRABLE',
		);
		$this->addSql('CREATE INDEX IDX_5F37A13BDF867A8C ON token (challenge_for_id)');
	}

	public function down(Schema $schema): void
	{
		// Time machines don't exists
	}
}
