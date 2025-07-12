<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250712225213 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE drink ADD drinker_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE drink ADD CONSTRAINT FK_DBE40D19A29D896 FOREIGN KEY (drinker_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_DBE40D19A29D896 ON drink (drinker_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE drink DROP CONSTRAINT FK_DBE40D19A29D896');
        $this->addSql('DROP INDEX IDX_DBE40D19A29D896');
        $this->addSql('ALTER TABLE drink DROP drinker_id');
    }
}
