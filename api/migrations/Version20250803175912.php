<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250803175912 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE tea_type ADD created_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT \'NOW()\' NOT NULL');
        $this->addSql('ALTER TABLE tea_type ADD created_by_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE tea_type ADD CONSTRAINT FK_40C72F91B03A8386 FOREIGN KEY (created_by_id) REFERENCES "user" (id)');
        $this->addSql('CREATE INDEX IDX_40C72F91B03A8386 ON tea_type (created_by_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE tea_type DROP CONSTRAINT FK_40C72F91B03A8386');
        $this->addSql('DROP INDEX IDX_40C72F91B03A8386');
        $this->addSql('ALTER TABLE tea_type DROP created_at');
        $this->addSql('ALTER TABLE tea_type DROP created_by_id');
    }
}
