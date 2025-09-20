<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250920202604 extends AbstractMigration
{
	public function getDescription(): string
	{
		return 'Add created_at/updated_at on most of entities';
	}

	public function up(Schema $schema): void
	{
		// Origin
		$this->addSql(
			<<<SQL
			ALTER TABLE origin
				ADD created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT now(),
				ADD updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT now()
			SQL,
		);

		// Tea
		$this->addSql("ALTER TABLE tea ADD updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT now()");
		$this->addSql("UPDATE tea SET updated_at=created_at");

		// Tea session
		$this->addSql(
			<<<SQL
			ALTER TABLE tea_session
				ADD created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT now(),
				ADD updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT now()
			SQL,
		);
		$this->addSql("UPDATE tea_session SET created_at=drank_at, updated_at=drank_at");

		// Tea type
		$this->addSql("ALTER TABLE tea_type ADD updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT now()");
		$this->addSql("UPDATE tea_type SET updated_at=created_at");

		// User
		$this->addSql(
			<<<SQL
			ALTER TABLE "user"
				ADD created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT now(),
				ADD updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT now()
			SQL,
		);
	}

	public function down(Schema $schema): void
	{
		// Life's decisions cannot be undone, but their consequences can be mitigated
	}
}
