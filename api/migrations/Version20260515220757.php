<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260515220757 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add relation between sessions and collection teas';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE tea_session ADD collection_tea_id INT DEFAULT NULL');
        $this->addSql(<<<SQL
            ALTER TABLE tea_session ADD CONSTRAINT FK_9884218E981C62FB
                FOREIGN KEY (collection_tea_id)
                    REFERENCES collection_tea (id) NOT DEFERRABLE
        SQL);
        $this->addSql('CREATE INDEX IDX_9884218E981C62FB ON tea_session (collection_tea_id)');
    }
}
