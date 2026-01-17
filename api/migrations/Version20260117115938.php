<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260117115938 extends AbstractMigration
{
    public function getDescription(): string
    {
        return "Use path to reference tea's origin";
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE tea ADD origin_path ltree NULL');
        $this->addSql(
			<<<SQL
			UPDATE tea SET origin_path = (SELECT path FROM origin WHERE origin.id = origin_id)
			WHERE origin_path IS NULL
			SQL,
		);
        $this->addSql('ALTER TABLE tea ALTER COLUMN origin_path SET NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // It's better now, why going back?
    }
}
