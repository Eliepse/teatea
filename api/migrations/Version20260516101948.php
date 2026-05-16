<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260516101948 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Change technic to brewing type';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('UPDATE tea_session SET technic = NULL');
        $this->addSql('ALTER TABLE tea_session RENAME COLUMN technic TO brewing_type');
    }
}
