<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250803180103 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE tea_type DROP CONSTRAINT fk_40c72f91b03a8386');
        $this->addSql('DROP INDEX idx_40c72f91b03a8386');
        $this->addSql('ALTER TABLE tea_type ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('ALTER TABLE tea_type ALTER created_at SET DEFAULT \'NOW()\'');
        $this->addSql('ALTER TABLE tea_type RENAME COLUMN created_by_id TO created_by');
        $this->addSql('ALTER TABLE tea_type ADD CONSTRAINT FK_40C72F91DE12AB56 FOREIGN KEY (created_by) REFERENCES "user" (id) NOT DEFERRABLE');
        $this->addSql('CREATE INDEX IDX_40C72F91DE12AB56 ON tea_type (created_by)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE tea_type DROP CONSTRAINT FK_40C72F91DE12AB56');
        $this->addSql('DROP INDEX IDX_40C72F91DE12AB56');
        $this->addSql('ALTER TABLE tea_type ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('ALTER TABLE tea_type ALTER created_at SET DEFAULT \'2025-08-03 17:59:21.317756\'');
        $this->addSql('ALTER TABLE tea_type RENAME COLUMN created_by TO created_by_id');
        $this->addSql('ALTER TABLE tea_type ADD CONSTRAINT fk_40c72f91b03a8386 FOREIGN KEY (created_by_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX idx_40c72f91b03a8386 ON tea_type (created_by_id)');
    }
}
