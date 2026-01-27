<?php

namespace App\Command;

use App\Repository\TeaTypeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
	name: "app:tea:fix_family_types",
	description: "Associate each tea without type to its corresponding default TeaType",
)]
class TeaFixFamilyTypesCommand extends Command
{
	public function __construct(
		private EntityManagerInterface $em,
		private TeaTypeRepository $typeRepository,
	) {
		parent::__construct();
	}

	protected function execute(InputInterface $input, OutputInterface $output): int
	{
		$io = new SymfonyStyle($input, $output);

		$familyTypes = $this->typeRepository->getFamilies();

		foreach ($familyTypes as $type) {
			$result = $this->em->createQuery(<<<DQL
				UPDATE App\Entity\Tea tea SET tea.type = :type
				WHERE tea.family = :family AND tea.type IS NULL
				DQL)->execute(["type" => $type, "family" => $type->family]);
			$io->success("{$type->family->name}: $result teas associated");
		}

		return Command::SUCCESS;
	}
}
