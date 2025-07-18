import { PageLayout } from "~/components/shared/paged/PageLayout";
import { useTeas } from "~/utils/api/useTeas";
import { type Tea, teaFamilies, type TeaFamily } from "~t/types";
import clsx from "clsx";
import { useStackNavigator } from "~/utils/navigation/useNavigationStack";
import Arrow from "~/components/icons/arrow";
import { handleUIEvent } from "~/utils/function";
import { Fragment, useMemo } from "react";

export function SelectTeaFrame(props: { value?: Tea | null; onSelect: (tea: Tea) => void }) {
	const navStack = useStackNavigator();
	const teasQuery = useTeas();
	const items = teasQuery?.data?.member ?? [];

	const teasByFamily = useMemo(() => {
		const groups = Object.fromEntries(Object.keys(teaFamilies).map((key) => [key, [] as Tea[]])) as {
			[key in TeaFamily]: Tea[];
		};
		return items.reduce((groups, tea) => {
			groups[tea.family].push(tea);
			return groups;
		}, groups);
	}, [items]);

	return (
		<PageLayout
			title="Select a tea"
			onBack={navStack.back}
			action={
				<div className="flex justify-center">
					{props.value && (
						<button
							className="ml-2 btn btn-primary rounded-full"
							onClick={handleUIEvent(() => navStack.next({ key: "form" }))}
						>
							Confirm
							<Arrow direction="right" className="size-4 ml-1" />
						</button>
					)}
				</div>
			}
			bodyClassName="pb-20"
		>
			{teasQuery.isLoading && (
				<>
					<div className="skeleton h-10 mb-2 block"></div>
					<div className="skeleton h-10 mb-2 block"></div>
					<div className="skeleton h-10 mb-2 block"></div>
					<div className="skeleton h-10 mb-2 block"></div>
					<div className="skeleton h-10 mb-2 block"></div>
					<div className="skeleton h-10 mb-2 block"></div>
					<div className="skeleton h-10 mb-2 block"></div>
					<div className="skeleton h-10 mb-2 block"></div>
				</>
			)}

			{teasQuery.isError && <div className="text-error">Something went wrong...</div>}

			{teasQuery.isSuccess &&
				Object.entries(teasByFamily).map(([key, teas]) => (
					<Fragment key={key}>
						<div className="text-xs uppercase text-base-content/60 mb-2 mt-6">{teaFamilies[key as TeaFamily]}</div>
						{teas.map((tea) => (
							<TeaItem
								key={tea["@id"]}
								title={tea.displayName}
								family={tea.family + " tea"}
								type={tea.type?.name}
								country={tea.originPath?.country?.name}
								region={tea.originPath?.region?.name}
								locality={tea.originPath?.locality?.name}
								onSelect={() => props.onSelect(tea)}
								selected={props.value?.["@id"] === tea["@id"]}
								className="mb-2"
							/>
						))}
					</Fragment>
				))}
		</PageLayout>
	);
}

function TeaItem(props: {
	title: string;
	onSelect: () => void;
	selected?: boolean;
	className?: string;
	country?: string | null;
	region?: string | null;
	locality?: string | null;
	family: string;
	type?: string;
}) {
	const countryOnly = !props.locality && !props.region;

	return (
		<article
			className={clsx("bg-base-100 px-4 py-3 flex", props.selected && "bg-base-300", props.className)}
			onClick={props.onSelect}
		>
			<div className="flex-1">{props.title}</div>
			<div className="text-xs text-right">
				{<div>{props.type ?? props.family}</div>}
				{countryOnly ? (
					props.country
				) : (
					<>
						{[props.locality, props.region].filter((s) => s).join(", ")} ({props.country})
					</>
				)}
			</div>
		</article>
	);
}
