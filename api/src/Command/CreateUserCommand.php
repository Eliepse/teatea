<?php

namespace App\Command;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
	name: 'app:create-user',
	description: 'Create a new regular user',
)]
class CreateUserCommand extends Command
{
	public function __construct(
		private readonly UserPasswordHasherInterface $hasher,
		private readonly EntityManagerInterface      $entityManager,
	)
	{
		parent::__construct();
	}

	protected function configure(): void
	{
		$this
			->addArgument('email', InputArgument::REQUIRED, 'The email of the new user')
			->addArgument('username', InputArgument::REQUIRED, 'The nickname');
	}

	protected function execute(InputInterface $input, OutputInterface $output): int
	{
		$io = new SymfonyStyle($input, $output);
		$email = $input->getArgument('email');
		$username = trim($input->getArgument('username'));

		if (empty($email) || null === filter_var($email, FILTER_VALIDATE_EMAIL, FILTER_NULL_ON_FAILURE)) {
			$io->error("You must pass an email");
			return Command::INVALID;
		}

		if (empty($username)) {
			$io->error("You must pass a username");
			return Command::INVALID;
		}

		$user = new User();
		$user->email = $email;
		$user->username = $username;
		$user->setPassword($this->hasher->hashPassword($user, $io->askHidden("Password")));
		$user->setRoles(["ROLE_USER"]);
		$this->entityManager->persist($user);
		$this->entityManager->flush();

		$io->success("User created (id: $user->id)");

		return Command::SUCCESS;
	}
}
