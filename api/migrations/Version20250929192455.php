<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250929192455 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE origin ADD validated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT now()');
        $this->addSql('ALTER TABLE origin ALTER COLUMN validated_at SET DEFAULT null');
    }

    public function down(Schema $schema): void
    {
        // Time only flows in one direction
    }
}
