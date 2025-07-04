import { PageLayout } from "~/components/shared/paged/PageLayout";
import { useTeas } from "~/utils/api/useTeas";
import type { Tea } from "~t/types";
import clsx from "clsx";
import { useStackNavigator } from "~/utils/navigation/useNavigationStack";
import Arrow from "~/components/icons/arrow";
import type { BaseSyntheticEvent } from "react";
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
			{items.map((item) => (
				<TeaItem
					key={item["@id"]}
					name={item["@id"] + " - " + (item.name || item.type?.name || item.family)}
					onSelect={() => props.onSelect(item)}
					selected={props.value?.["@id"] === item["@id"]}
					className="mb-2"
				/>
			))}
		</PageLayout>
	);
}

function TeaItem(props: { name: string; onSelect: () => void; selected?: boolean; className?: string }) {
	return (
		<button
			className={clsx("btn btn-block", props.selected && "btn-primary", props.className)}
			onClick={props.onSelect}
		>
			{props.name}
		</button>
	);
}
