<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260102113505 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE media_object ADD size INT DEFAULT NULL');
        $this->addSql('ALTER TABLE media_object ADD mime_type TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE media_object ADD dimensions JSON DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE media_object DROP size');
        $this->addSql('ALTER TABLE media_object DROP mime_type');
        $this->addSql('ALTER TABLE media_object DROP dimensions');
    }
}
