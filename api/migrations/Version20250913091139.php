<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250913091139 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE drink RENAME COLUMN drinker_id TO author_id');
        $this->addSql('ALTER TABLE drink RENAME TO tea_session');
    }

    public function down(Schema $schema): void
    {
        // No going back!
    }
}
