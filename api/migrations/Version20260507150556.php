<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260507150556 extends AbstractMigration
{
	public function getDescription(): string
	{
		return 'Change relation strategy between tea and business';
	}

	public function up(Schema $schema): void
	{
		$this->addSql('ALTER TABLE business_tea DROP CONSTRAINT fk_10f5e6c26a399a0d');
		$this->addSql('ALTER TABLE business_tea DROP CONSTRAINT fk_10f5e6c2a89db457');
		$this->addSql('DROP TABLE business_tea');
		$this->addSql(
			<<<SQL
            ALTER TABLE tea
                ADD business_id INT DEFAULT NULL,
                ADD CONSTRAINT FK_8E86D7B2A89DB457
                    FOREIGN KEY (business_id) REFERENCES business (id)
        SQL,
		);
		$this->addSql('CREATE INDEX IDX_8E86D7B2A89DB457 ON tea (business_id)');
	}
}
