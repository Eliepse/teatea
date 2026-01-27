<?php

declare(strict_types=1);

namespace App\Command\Seeders;

use App\Entity\Business;
use App\Entity\User;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Yaml\Yaml;

#[AsCommand(name: "app:seed:business", description: "Seeds businesses")]
final readonly class BusinessSeederCommand
{
	public function __construct(
		private EntityManagerInterface $em,
	) {}

	public function __invoke(SymfonyStyle $io): int
	{
		$countQuery = $this->em->createQuery("SELECT count(business) FROM App\Entity\Business business");
		if (0 !== $countQuery->getSingleResult(AbstractQuery::HYDRATE_SINGLE_SCALAR)) {
			if (false === $io->confirm("The table isn't empty, are you sure you want to proceed?", false)) {
				return Command::SUCCESS;
			}
		}

		do {
			$userId = $io->ask("Who should be the author?");
			$author = $this->em->find(User::class, $userId);

			if (null === $author) {
				continue;
			}

			if (false === $io->confirm("Confirm '$author->username' as author?")) {
				$author = null;
			}
		} while (!$author instanceof User);

		$businesses = Yaml::parseFile(__DIR__ . "/../../../data/businesses.yaml")["businesses"] ?? [];

		foreach ($businesses as $data) {
			$entity = new Business();
			$entity->name = $data["name"];
			$entity->author = $author;
			$this->em->persist($entity);
		}

		$this->em->flush();

		return Command::SUCCESS;
	}
}
