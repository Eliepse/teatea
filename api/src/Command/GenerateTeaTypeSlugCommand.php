<?php

namespace App\Command;

use App\Entity\TeaType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\String\Slugger\AsciiSlugger;

#[AsCommand(name: "app:tea-type:gen-slug", description: "Re-generate tea types slug")]
class GenerateTeaTypeSlugCommand extends Command
{
	public function __construct(
		private readonly EntityManagerInterface $em,
	) {
		parent::__construct();
	}

	protected function execute(InputInterface $input, OutputInterface $output): int
	{
		/** @var TeaType[] $types */
		$types = $this->em->createQuery("SELECT type FROM App\Entity\TeaType type")->getResult();

		foreach ($types as $type) {
			$key = bin2hex(random_bytes(1));
			$type->slug = new AsciiSlugger()
				->slug("$key $type->name")
				->lower()
				->toString();
			$this->em->persist($type);
		}

		$this->em->flush();

		return Command::SUCCESS;
	}
}
