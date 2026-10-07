import { useQuery } from "@tanstack/react-query";
import { makeMemberStatsQueryOpt } from "~/account/query/memberStatsQuery";
import { Fragment } from "react";
import { UserStat } from "~/components/stats/UserStat";
import { CoffeeCup, Leaf } from "iconoir-react";

export function TopUserStats(props: { username: string }) {
	const { data, isLoading } = useQuery(makeMemberStatsQueryOpt(props.username));
	const leavesKg = data?.statsConsumedTeaKgTotal ?? 0;

	return (
		<Fragment>
			<UserStat
				title="tea sessions"
				value={data?.statsSessionsTotal ?? 0}
				icon={<CoffeeCup className="size-5 inline mx-1" />}
				loading={isLoading}
			/>

			<UserStat
				title="tasted teas"
				value={data?.statsConsumedTeasTotal ?? 0}
				icon={<Leaf className="size-5 inline mx-1" />}
				loading={isLoading}
			/>

			<UserStat
				title="brewed leaves"
				value={leavesKg > 1 ? leavesKg.toFixed(2) : leavesKg * 1000}
				icon={<span className="text-lg font-normal mx-1">{leavesKg > 1 ? "kg" : "g"}</span>}
				loading={isLoading}
			/>
		</Fragment>
	);
}
