<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260420151620 extends AbstractMigration
{
	public function getDescription(): string
	{
		return 'Support referral users';
	}

	public function up(Schema $schema): void
	{
		$this->addSql('ALTER TABLE "user" ADD referrer_id INT DEFAULT NULL');
		$this->addSql(
			<<<SQL
            ALTER TABLE "user"
            	ADD CONSTRAINT FK_8D93D649798C22DB FOREIGN KEY (referrer_id)
            	    REFERENCES "user" (id)
            SQL,
		);
		$this->addSql('CREATE INDEX IDX_8D93D649798C22DB ON "user" (referrer_id)');
	}

	public function down(Schema $schema): void
	{
		//
	}
}
