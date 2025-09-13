<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250913092004 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER INDEX idx_dbe40d16a399a0d RENAME TO IDX_9884218E6A399A0D');
        $this->addSql('ALTER INDEX idx_dbe40d19a29d896 RENAME TO IDX_9884218EF675F31B');
        $this->addSql('ALTER TABLE tea_session RENAME CONSTRAINT drink_pkey TO tea_session_pkey');
    }

    public function down(Schema $schema): void
    {
        // Don't look back
    }
}
