<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260123142639 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Fix user roles column type';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE "user" ALTER COLUMN roles TYPE jsonb USING roles::jsonb');
    }

    public function down(Schema $schema): void
    {
        // No no no, stop right there
    }
}
