<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250720192131 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE tea ADD created_by_id INT NOT NULL');
        $this->addSql('ALTER TABLE tea ADD CONSTRAINT FK_8E86D7B2B03A8386 FOREIGN KEY (created_by_id) REFERENCES "user" (id) NOT DEFERRABLE');
        $this->addSql('CREATE INDEX IDX_8E86D7B2B03A8386 ON tea (created_by_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE tea DROP CONSTRAINT FK_8E86D7B2B03A8386');
        $this->addSql('DROP INDEX IDX_8E86D7B2B03A8386');
        $this->addSql('ALTER TABLE tea DROP created_by_id');
    }
}
