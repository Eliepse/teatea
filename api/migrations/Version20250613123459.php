<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250613123459 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE cultivar ALTER name TYPE TEXT');
        $this->addSql('ALTER TABLE origin ALTER name TYPE TEXT');
        $this->addSql('ALTER TABLE tea ALTER name TYPE TEXT');
        $this->addSql('ALTER TABLE tea_type DROP "position"');
        $this->addSql('ALTER TABLE tea_type ALTER name TYPE TEXT');
        $this->addSql('ALTER TABLE tea_type RENAME COLUMN path TO family');
        $this->addSql('ALTER TABLE tea_type ALTER family TYPE VARCHAR(255)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE tea_type ADD "position" INT DEFAULT NULL');
        $this->addSql('ALTER TABLE tea_type ALTER name TYPE VARCHAR(255)');
        $this->addSql('ALTER TABLE tea_type RENAME COLUMN family TO path');
        $this->addSql('ALTER TABLE tea_type ALTER path TYPE VARCHAR(255)');
        $this->addSql('ALTER TABLE origin ALTER name TYPE VARCHAR(255)');
        $this->addSql('ALTER TABLE cultivar ALTER name TYPE VARCHAR(255)');
        $this->addSql('ALTER TABLE tea ALTER name TYPE VARCHAR(255)');
    }
}
