<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250714215136 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE drink ALTER technic TYPE VARCHAR(255)');
        $this->addSql('ALTER TABLE tea_type ADD origin_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE tea_type ADD CONSTRAINT FK_40C72F9156A273CC FOREIGN KEY (origin_id) REFERENCES origin (id)');
        $this->addSql('CREATE INDEX IDX_40C72F9156A273CC ON tea_type (origin_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE drink ALTER technic TYPE TEXT');
        $this->addSql('ALTER TABLE tea_type DROP CONSTRAINT FK_40C72F9156A273CC');
        $this->addSql('DROP INDEX IDX_40C72F9156A273CC');
        $this->addSql('ALTER TABLE tea_type DROP origin_id');
    }
}
