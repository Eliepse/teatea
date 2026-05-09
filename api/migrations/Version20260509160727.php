<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260509160727 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Remove business relation from CollectionTea';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE collection_tea DROP CONSTRAINT fk_260f78d6b43aa055');
        $this->addSql('DROP INDEX idx_260f78d6b43aa055');
        $this->addSql('ALTER TABLE collection_tea DROP acquired_from_id');
    }
}
