import { PageLayout } from "~/components/shared/paged/PageLayout";
import clsx from "clsx";
import { useStackNavigator } from "~/utils/navigation/useNavigationStack";
import Arrow from "~/components/icons/arrow";
import { handleUIEvent } from "~/utils/function";
import { BrewingTechnic, brewingTechnic, type TechnicType } from "~/components/shared/BrewingTechnic";

export function SelectTechnicFrame(props: {
	value?: TechnicType | null;
	onSelect: (value: TechnicType | null) => void;
}) {
	const navStack = useStackNavigator();

	function toggleValue(key: TechnicType): void {
		if (props.value === key) {
			props.onSelect(null);
			return;
		}

		props.onSelect(key);
	}

	return (
		<PageLayout
			title="Select a technic"
			onBack={navStack.back}
			action={
				<button
					className="ml-auto btn btn-primary"
					onClick={handleUIEvent(() => navStack.next({ key: "form" }))}
					disabled={!props.value}
				>
					Confirm
					<Arrow direction="right" className="size-4 ml-1" />
				</button>
			}
		>
			{Object.keys(brewingTechnic).map((key) => (
				<Item
					key={key}
					technic={key as TechnicType}
					onSelect={() => toggleValue(key as TechnicType)}
					selected={props.value === key}
					className="mb-2"
				/>
			))}
		</PageLayout>
	);
}

function Item(props: { technic: TechnicType; onSelect: () => void; selected?: boolean; className?: string }) {
	return (
		<article
			className={clsx(
				"bg-base-100 px-4 py-3 flex rounded",
				props.selected ? "bg-primary text-white" : "bg-base-200",
				props.className,
			)}
			onClick={props.onSelect}
		>
			<BrewingTechnic value={props.technic} />
		</article>
	);
}
