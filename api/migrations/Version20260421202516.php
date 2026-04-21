<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260421202516 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Fix some json typing';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("ALTER TABLE media_object ALTER dimensions TYPE JSONB");
        $this->addSql("ALTER TABLE tea ALTER harvest TYPE JSONB");
        $this->addSql("ALTER TABLE tea_session ALTER steeps TYPE JSONB");
    }

    public function down(Schema $schema): void
    {
		//
    }
}
