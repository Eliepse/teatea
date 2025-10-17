import { PageLayout } from "~/components/shared/paged/PageLayout";
import { type OriginPath, type Tea, teaFamilies, type TeaFamily } from "~t/types";
import clsx from "clsx";
import Arrow from "~/components/icons/arrow";
import { handleUIEvent } from "~/utils/function";
import { useMemo, useState } from "react";
import { FormatOriginPath } from "../shared/FormatOriginPath";
import { TeaSearchEngine } from "~/components/search/TeaSearchEngine";

export function SelectTeaFrame(props: { onConfirm: (tea: Tea) => void; defaultValue?: Tea; onBack: () => void }) {
	const [selected, setSelected] = useState(props.defaultValue);

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
					Select
					<Arrow direction="right" className="size-4 ml-1" />
				</button>
			}
			bodyClassName="overflow-y-hidden"
			withoutPadding
		>
			<TeaSearchEngine onSelect={setSelected} value={selected} allowCreation />
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
