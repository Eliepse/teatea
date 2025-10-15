<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251015193538 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add origin\'s author';
    }

    public function up(Schema $schema): void
    {
	    $this->addSql('ALTER TABLE origin ADD author_id INT DEFAULT NULL');
	    $this->addSql('ALTER TABLE origin ADD CONSTRAINT fk_def1561ef675f31b FOREIGN KEY (author_id) REFERENCES "user" (id) ON DELETE SET NULL NOT DEFERRABLE');
	    $this->addSql('CREATE INDEX idx_def1561ef675f31b ON origin (author_id)');
    }

    public function down(Schema $schema): void
    {
        // Tomorrow is another day!
    }
}
