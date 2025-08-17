import { PageLayout } from "~/components/shared/paged/PageLayout";
import { useTeas } from "~/utils/api/useTeas";
import { type OriginPath, type Tea, teaFamilies, type TeaFamily } from "~t/types";
import clsx from "clsx";
import Arrow from "~/components/icons/arrow";
import { handleUIEvent } from "~/utils/function";
import { Fragment, useMemo, useState } from "react";
import { FormatOriginPath } from "../shared/FormatOriginPath";
import { CreateTeaButton } from "~/components/tea/CreateTeaButton";

export function SelectTeaFrame(props: { onConfirm: (tea: Tea) => void; defaultValue?: Tea; onBack: () => void }) {
	const teasQuery = useTeas();
	const [selected, setSelected] = useState(props.defaultValue);
	const teasByFamily = useMemo(() => {
		const groups = Object.fromEntries(Object.keys(teaFamilies).map((key) => [key, [] as Tea[]])) as {
			[key in TeaFamily]: Tea[];
		};
		return (teasQuery?.data?.member ?? []).reduce((groups, tea) => {
			groups[tea.family].push(tea);
			return groups;
		}, groups);
	}, [teasQuery?.data?.member]);

	async function onTeaCreated(tea: Tea) {
		const result = await teasQuery.refetch();
		setSelected(result.data?.member?.find(t => t.id === tea.id));
	}

	function confirm() {
		if (!selected) {
			return;
		}

		props.onConfirm(selected);
	}

	return (
		<PageLayout
			title="Select a tea"
			onBack={props.onBack}
			action={
				<button className="ml-auto btn btn-primary" onClick={handleUIEvent(confirm)} disabled={!selected}>
					Confirm
					<Arrow direction="right" className="size-4 ml-1" />
				</button>
			}
			bodyClassName="pb-8"
			withoutPadding
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
						<div
							className="sticky top-0 bg-white px-4 py-2 text-xs uppercase text-base-content/60 mb-2 mt-6 tracking-wide font-semibold">
							{teaFamilies[key as TeaFamily]}
						</div>
						<ul className="px-4">
							{teas.map((tea) => (
								<li key={tea["@id"]}>
									<TeaItem
										title={tea.displayName}
										family={tea.family + " tea"}
										type={tea.type?.name}
										originPath={tea.originPath}
										onSelect={() => setSelected(tea)}
										selected={selected?.["@id"] === tea["@id"]}
										className="mb-2"
									/>
								</li>
							))}
						</ul>
					</Fragment>
				))}

			{teasQuery.isSuccess && (
				<div className="px-4">
					<CreateTeaButton className="btn-outline btn-block mt-4" onCreated={onTeaCreated} />
				</div>
			)}
		</PageLayout>
	);
}

function TeaItem(props: {
	title: string;
	onSelect: () => void;
	selected?: boolean;
	className?: string;
	originPath?: OriginPath;
	family: string;
	type?: string;
}) {
	return (
		<article
			className={clsx(
				"bg-base-200 rounded px-4 py-3 h-16 flex items-center",
				props.selected && "bg-primary text-white",
				props.className
			)}
			onClick={props.onSelect}
		>
			<div className="flex-1">{props.title}</div>
			<div className="text-xs text-right">
				{<div>{props.type ? props.family : ""}</div>}
				{props.originPath && <FormatOriginPath originPath={props.originPath} />}
			</div>
		</article>
	);
}
