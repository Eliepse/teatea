import type { Route } from "../../../.react-router/types/app/pages/member/+types/personal-collection";
import { useQuery } from "@tanstack/react-query";
import { BackButton } from "~/components/shared/navigation/BackButton";
import { WithMainMenu } from "~/layouts/WithMainMenu";
import { TokenUtils } from "~/auth/hooks/useToken";
import { CollectionTeaCard } from "~/pages/member/_components/CollectionTeaCard";
import { Link } from "react-router";
import { EmojiSurprise, Search } from "iconoir-react";
import clsx from "clsx";
import { makeMemberTeaCollectionQueryOpt } from "~/shared/query/memberTeaQuery";

export async function clientLoader(args: Route.ClientLoaderArgs) {
	const token = TokenUtils.get();
	const { username } = args.params;

	if (token?.username !== username) {
		throw new Error();
	}

	return null;
}

export default function PersonalCollectionPage(props: Route.ComponentProps) {
	const itemsQuery = useQuery(makeMemberTeaCollectionQueryOpt(props.params.username, {}, { itemsPerPage: 50 }));

	const active = itemsQuery.data?.member?.filter((el) => !el.finishedAt) ?? [];
	const inactive = itemsQuery.data?.member?.filter((el) => !!el.finishedAt) ?? [];

	return (
		<WithMainMenu activeKey="my-teas" className="p-4 pb-20 bg-green-50 min-h-dvh">
			<header className="mb-8 pt-2 relative">
				<BackButton className="mr-auto shadow-sm absolute top-0 left-0" />
				<h1 className="text-3xl font-bold font-header text-center text-green-900">My teas</h1>
			</header>

			{!itemsQuery.isLoading && 0 === itemsQuery.data?.totalItems && (
				<div className="mt-16 px-4 py-8 text-green-700 bg-white/60 rounded-xl text-center">
					<EmojiSurprise className="size-6 mx-auto mb-4" />
					It seems you do not have register any tea yet. Search for a tea and start keeping track of your tea
					collection&nbsp;!
					<Link
						to="/tea/search"
						className="flex items-center justify-center mt-8 text-green-900 p-2 border border-green-700 rounded-md"
					>
						<Search className="size-4 mr-2" /> Look for a tea
					</Link>
				</div>
			)}

			<ul className="mb-8">
				{active.map((item) => (
					<li key={item.id} className={clsx("mb-3", !!item.finishedAt && "opacity-60")}>
						<Link to={`/members/${props.params.username}/teas/${item.id}`}>
							<CollectionTeaCard
								tea={item.tea}
								acquiredFrom={item.acquiredFrom}
								acquiredAt={item.acquiredAt}
								description={item.description}
								thumbnail={item.thumbnail}
							/>
						</Link>
					</li>
				))}
			</ul>

			{0 !== inactive.length && (
				<>
					<h2 className="uppercase text-sm font-medium text-stone-500 mb-4">Finished</h2>
					<ul>
						{inactive.map((item) => (
							<li key={item.id} className="mb-3">
								<Link to={`/members/${props.params.username}/teas/${item.id}`}>
									<CollectionTeaCard
										tea={item.tea}
										acquiredFrom={item.acquiredFrom}
										acquiredAt={item.acquiredAt}
										description={item.description}
										thumbnail={item.thumbnail}
									/>
								</Link>
							</li>
						))}
					</ul>
				</>
			)}
		</WithMainMenu>
	);
}
