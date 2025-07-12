<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250711160639 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE user_tea (user_id INT NOT NULL, tea_id INT NOT NULL, PRIMARY KEY(user_id, tea_id))');
        $this->addSql('CREATE INDEX IDX_6590B639A76ED395 ON user_tea (user_id)');
        $this->addSql('CREATE INDEX IDX_6590B6396A399A0D ON user_tea (tea_id)');
        $this->addSql('ALTER TABLE user_tea ADD CONSTRAINT FK_6590B639A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE user_tea ADD CONSTRAINT FK_6590B6396A399A0D FOREIGN KEY (tea_id) REFERENCES tea (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE tea DROP CONSTRAINT fk_8e86d7b2a76ed395');
        $this->addSql('DROP INDEX idx_8e86d7b2a76ed395');
        $this->addSql('ALTER TABLE tea DROP user_id');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user_tea DROP CONSTRAINT FK_6590B639A76ED395');
        $this->addSql('ALTER TABLE user_tea DROP CONSTRAINT FK_6590B6396A399A0D');
        $this->addSql('DROP TABLE user_tea');
        $this->addSql('ALTER TABLE tea ADD user_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE tea ADD CONSTRAINT fk_8e86d7b2a76ed395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX idx_8e86d7b2a76ed395 ON tea (user_id)');
    }
}
