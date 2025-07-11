import { PageLayout } from "~/components/shared/paged/PageLayout";
import { useTeas } from "~/utils/api/useTeas";
import type { Tea } from "~t/types";
import clsx from "clsx";
import { useStackNavigator } from "~/utils/navigation/useNavigationStack";
import Arrow from "~/components/icons/arrow";
import { handleUIEvent } from "~/utils/function";

export function SelectTeaFrame(props: { value?: Tea | null; onSelect: (tea: Tea) => void }) {
	const navStack = useStackNavigator();
	const teasQuery = useTeas();
	const items = teasQuery?.data?.member ?? [];

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
				items.map((item) => (
					<TeaItem
						key={item["@id"]}
						title={item.displayName}
						family={item.family + " tea"}
						type={item.type?.name}
						country={item.originPath?.country?.name}
						region={item.originPath?.region?.name}
						locality={item.originPath?.locality?.name}
						onSelect={() => props.onSelect(item)}
						selected={props.value?.["@id"] === item["@id"]}
						className="mb-2"
					/>
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
