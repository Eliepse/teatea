<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251017122446 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Use Postgres enum to save roast info';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("CREATE TYPE RoastLevel as ENUM('no','yes','light','mild','strong')");
        $this->addSql('ALTER TABLE tea DROP roast');
        $this->addSql('ALTER TABLE tea ADD roast RoastLevel NULL');
    }

    public function down(Schema $schema): void
    {
        // You can't unroast a leaf
    }
}
