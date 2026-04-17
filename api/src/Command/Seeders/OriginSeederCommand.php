<?php

declare(strict_types=1);

namespace App\Command\Seeders;

use App\Doctrine\DBAL\Types\ValueObject\LTreePath;
use App\Entity\Origin;
use App\Entity\User;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Yaml\Yaml;

#[AsCommand(name: "app:seed:origin", description: "Seeds origins")]
final readonly class OriginSeederCommand
{
	public function __construct(
		private EntityManagerInterface $em,
	) {
	}

	public function __invoke(SymfonyStyle $io): int
	{
		$countQuery = $this->em->createQuery("SELECT count(origin) FROM App\Entity\Origin origin");
		if (0 !== $countQuery->getSingleResult(AbstractQuery::HYDRATE_SINGLE_SCALAR)) {
			if (false === $io->confirm("The table isn't empty, are you sure you want to proceed?", false)) {
				return Command::SUCCESS;
			}
		}

		do {
			/** @var int|string $userId */
			$userId = $io->ask("Who should be the author?");
			$author = $this->em->find(User::class, $userId);

			if (null === $author) {
				continue;
			}

			if (false === $io->confirm("Confirm '$author->username' as author?")) {
				$author = null;
			}
		} while (!$author instanceof User);

		/** @var array{ name: string }[] $businesses */
		$businesses = Yaml::parseFile(__DIR__ . "/../../../data/origins.yaml")["origins"] ?? [];

		foreach ($businesses as $data) {
			$entity = new Origin();
			$entity->name = $data["name"];
			$entity->path = LTreePath::fromString($data["path"]);

			// @mago-expect analysis:undefined-variable,mixed-property-type-coercion
			$entity->author = $author;

			$this->em->persist($entity);
		}

		$this->em->flush();

		return Command::SUCCESS;
	}
}
