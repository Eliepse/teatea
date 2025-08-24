<?php

namespace App\Command;

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\ParameterType;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
	name: 'app:db:seed-origin',
	description: 'Create a base of origins',
)]
class SeedOriginTableCommand extends Command
{
	public function __construct(
		private readonly Connection $connection,
	) {
		parent::__construct();
	}

	protected function configure(): void
	{
//		$this
//			->addArgument('email', InputArgument::REQUIRED, 'The email of the new user')
//			->addArgument('username', InputArgument::REQUIRED, 'The nickname');
	}

	/** @noinspection SpellCheckingInspection */
	protected function execute(InputInterface $input, OutputInterface $output): int
	{
		$io = new SymfonyStyle($input, $output);

		// China
		$this->createOrigin($io, "China", "China");
		$this->createOrigin($io, "China.Anhui", "Anhui");
		$this->createOrigin($io, "China.Shandong", "Shandong");
		$this->createOrigin($io, "China.Jiangsu", "Jiangsu");
		$this->createOrigin($io, "China.Henan", "Henan");
		$this->createOrigin($io, "China.Hubei", "Hubei");
		$this->createOrigin($io, "China.Zhejiang", "Zhejiang");
		$this->createOrigin($io, "China.Zhejiang.Anji", "Anji");
		$this->createOrigin($io, "China.Zhejiang.Fuding", "Fuding");
		$this->createOrigin($io, "China.Zhejiang.Hangzhou", "Hangzhou");
		$this->createOrigin($io, "China.Fujian", "Fujian");
		$this->createOrigin($io, "China.Fujian.Anxi", "Anxi");
		$this->createOrigin($io, "China.Fujian.Wuyi", "Wuyi");
		$this->createOrigin($io, "China.Jiangxi", "Jiangxi");
		$this->createOrigin($io, "China.Hunan", "Hunan");
		$this->createOrigin($io, "China.Hunan.Gaoqiao", "Gaoqiao");
		$this->createOrigin($io, "China.Guangdong", "Guangdong");
		$this->createOrigin($io, "China.Guangdong.Wudong_Shan", "Wudong Shan");
		$this->createOrigin($io, "China.Guizhou", "Guizhou");
		$this->createOrigin($io, "China.Guangxi", "Guangxi");
		$this->createOrigin($io, "China.Sichuan", "Sichuan");
		$this->createOrigin($io, "China.Sichuan.MengShan", "Meng shan");
		$this->createOrigin($io, "China.Yunnan", "Yunnan");
		$this->createOrigin($io, "China.Yunnan.AiLaoShan", "AiLoa Shan");
		$this->createOrigin($io, "China.Yunnan.Kunming", "Kunming");
		$this->createOrigin($io, "China.Yunnan.Lincang", "Lincang");

		// Japan
		$this->createOrigin($io, "Japan", "Japan");
		$this->createOrigin($io, "Japan.Kanagawa", "Kanagawa");
		$this->createOrigin($io, "Japan.Tokushima", "Tokushima");
		$this->createOrigin($io, "Japan.Gifu", "Gifu");
		$this->createOrigin($io, "Japan.Aichi", "Aichi");
		$this->createOrigin($io, "Japan.Mie", "Mie");
		$this->createOrigin($io, "Japan.Fukuoka", "Fukuoka");
		$this->createOrigin($io, "Japan.Saga", "Saga");
		$this->createOrigin($io, "Japan.Miyazaki", "Miyazaki");
		$this->createOrigin($io, "Japan.Kagoshima", "Kagoshima");
		$this->createOrigin($io, "Japan.Kagoshima.Satsuma", "Satsuma");
		$this->createOrigin($io, "Japan.Kumamoto", "Kumamoto");
		$this->createOrigin($io, "Japan.Kyoto", "Kyôto");
		$this->createOrigin($io, "Japan.Kyoto.Kamo", "Kamo");
		$this->createOrigin($io, "Japan.Nara", "Nara");
		$this->createOrigin($io, "Japan.Nara.Yamazoe", "Yamazoe");
		$this->createOrigin($io, "Japan.Hyogo", "Hyôgo");
		$this->createOrigin($io, "Japan.Hyogo.Kamikawa", "Kamikawa");
		$this->createOrigin($io, "Japan.Kochi", "Kôchi");
		$this->createOrigin($io, "Japan.Kochi.Ino", "Ino");
		$this->createOrigin($io, "Japan.Shiga", "Shiga");
		$this->createOrigin($io, "Japan.Shiga.Asamiya", "Asamiya");
		$this->createOrigin($io, "Japan.Shizuoka", "Shizuoka");
		$this->createOrigin($io, "Japan.Shizuoka.Honoyama", "Honoyama");
		$this->createOrigin($io, "Japan.Shizuoka.Kawane", "Kawane");

		// India
		$this->createOrigin($io, "India", "India");
		$this->createOrigin($io, "India.Assam", "Assam");
		$this->createOrigin($io, "India.WestBengal", "West Bengal");
		$this->createOrigin($io, "India.WestBengal.Darjeeling", "Darjeeling");
		$this->createOrigin($io, "India.WestBengal.DooarsTerai", "Dooars and Terai");
		$this->createOrigin($io, "India.Kerala", "Kerala");
		$this->createOrigin($io, "India.TamilNadu", "Tamil Nadu");
		$this->createOrigin($io, "India.Karnataka", "Karnataka");
		$this->createOrigin($io, "India.HimachaiPradesh", "Himachai Pradesh");
		$this->createOrigin($io, "India.UttarPradesh", "Uttar Pradesh");

		// Taiwan
		$this->createOrigin($io, "Taiwan", "Taiwan");
		$this->createOrigin($io, "Taiwan.Nantou", "Nantou");
		$this->createOrigin($io, "Taiwan.Taipei", "Taipei");
		$this->createOrigin($io, "Taiwan.Hsinchu", "Hsinchu");
		$this->createOrigin($io, "Taiwan.Chiayi", "Chiayi");
		$this->createOrigin($io, "Taiwan.Taichung", "Taichung");
		$this->createOrigin($io, "Taiwan.Yilan", "Yilan");

		// South korea
		$this->createOrigin($io, "SouthKorea", "South Korea");
		$this->createOrigin($io, "SouthKorea.Hadong", "Hadong");
		$this->createOrigin($io, "SouthKorea.SouthJeolla", "South Jeolla");
		$this->createOrigin($io, "SouthKorea.Jeju", "Jeju");

		// Bengladesh
		$this->createOrigin($io, "Bangladesh", "Bangladesh");

		// Nepal
		$this->createOrigin($io, "Nepal", "Nepal");

		// Indonesia
		$this->createOrigin($io, "Indonesia", "Indonesia");
		$this->createOrigin($io, "Indonesia.NorthSumatra", "North Sumatra");
		$this->createOrigin($io, "Indonesia.SouthSumatra", "South Sumatra");
		$this->createOrigin($io, "Indonesia.WestSumatra", "West Sumatra");
		$this->createOrigin($io, "Indonesia.Banten", "Banten");
		$this->createOrigin($io, "Indonesia.Bengkulu", "Bengkulu");
		$this->createOrigin($io, "Indonesia.CentralJava", "Central Java");
		$this->createOrigin($io, "Indonesia.WestJava", "West Java");
		$this->createOrigin($io, "Indonesia.Yogyakarta", "Yogyakarta");

		// Vietnam
		$this->createOrigin($io, "Vietnam", "Vietnam");

		// Thailand
		$this->createOrigin($io, "Thailand", "Thailand");

		// Myanmar
		$this->createOrigin($io, "Myanmar", "Myanmar");

		// Sri Lanka
		$this->createOrigin($io, "SriLanka", "Sri Lanka (Ceylon)");
		$this->createOrigin($io, "SriLanka.Kandy", "Kandy");
		$this->createOrigin($io, "SriLanka.Matale", "Matale");
		$this->createOrigin($io, "SriLanka.Matara", "Matara");
		$this->createOrigin($io, "SriLanka.NuwaraEliya", "Nuwara Eliya");
		$this->createOrigin($io, "SriLanka.Ratnapura", "Ratnapura");
		$this->createOrigin($io, "SriLanka.Uva", "Uva");

		// France
		$this->createOrigin($io, "France", "France");

		// Kenya
		$this->createOrigin($io, "Kenya", "Kenya");
		$this->createOrigin($io, "Kenya.Kericho", "Kericho");
		$this->createOrigin($io, "Kenya.Kisii", "Kisii");
		$this->createOrigin($io, "Kenya.Nandi", "Nandi");

		// Tanzania
		$this->createOrigin($io, "Tanzania", "Tanzania");

		//Turkey
		$this->createOrigin($io, "Turkey", "Turkey");

		// Uganda
		$this->createOrigin($io, "Uganda", "Uganda");

		$io->success("Database seed complete");
		return Command::SUCCESS;
	}

	private function createOrigin(SymfonyStyle $io, string $path, string $name): void
	{
		try {
			$this->connection->executeStatement(
				"INSERT INTO origin (path, name) VALUES (?, ?) ON CONFLICT DO NOTHING",
				[$path, $name],
				[ParameterType::STRING, ParameterType::STRING],
			);
		} catch (\Throwable $e) {
			$io->error("Failed to insert: ($path, $name)");
		}
	}
}
