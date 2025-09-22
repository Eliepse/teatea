<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250922174118 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add cultivars to the app';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE cultivar ADD created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL');
        $this->addSql('ALTER TABLE cultivar ADD updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL');
        $this->addSql('ALTER TABLE cultivar ADD author_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE cultivar ADD CONSTRAINT FK_22CDE80EF675F31B FOREIGN KEY (author_id) REFERENCES "user" (id)');
        $this->addSql('CREATE INDEX IDX_22CDE80EF675F31B ON cultivar (author_id)');
        $this->addSql('ALTER TABLE origin ALTER created_at DROP DEFAULT');
        $this->addSql('ALTER TABLE origin ALTER updated_at DROP DEFAULT');
        $this->addSql('ALTER TABLE tea ALTER updated_at DROP DEFAULT');
        $this->addSql('ALTER TABLE tea_session ALTER created_at DROP DEFAULT');
        $this->addSql('ALTER TABLE tea_session ALTER updated_at DROP DEFAULT');
        $this->addSql('ALTER TABLE tea_type ALTER updated_at DROP DEFAULT');
        $this->addSql('ALTER TABLE "user" ALTER created_at DROP DEFAULT');
        $this->addSql('ALTER TABLE "user" ALTER updated_at DROP DEFAULT');
    }

    public function down(Schema $schema): void
    {
        // What is done is done, deal with it
    }
}
