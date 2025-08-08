import { PageLayout } from "~/components/shared/paged/PageLayout";
import { type TeaType } from "~t/types";
import { Check } from "~/components/icons/Check";
import { useState } from "react";
import clsx from "clsx";
import { useTeaTypes } from "~/utils/api/useTeaTypes";
import { handleUIEvent } from "~/utils/function";
import Arrow from "~/components/icons/arrow";

type Filters = Parameters<typeof useTeaTypes>[0];

export function SelectType(props: {
	onBack: () => void;
	onSelect: (value: TeaType) => void;
	defaultValue?: TeaType;
	filters?: Filters;
}) {
	const { data: types, isLoading } = useTeaTypes(props.filters);
	const [selected, setSelected] = useState(props.defaultValue);

	function toggleType(type: TeaType) {
		setSelected((st) => (st === type ? undefined : type));
	}

	function confirm() {
		if (undefined === selected) {
			console.warn("No tea type selected");
			return;
		}

		props.onSelect(selected);
	}

	return (
		<PageLayout
			title="Where does it come from?"
			onBack={props.onBack}
			bodyClassName="pb-20"
			action={
				<button
					className="ml-auto btn btn-primary"
					onClick={handleUIEvent(confirm)}
					disabled={!selected}
				>
					Next
					<Arrow direction="right" className="size-4 ml-1" />
				</button>
			}
		>
			{isLoading && "Loading..."}

			{types?.member?.map((type) => (
				<button
					key={type.id}
					onClick={handleUIEvent(() => toggleType(type))}
					className={clsx("mb-2 btn btn-block h-12 justify-start", selected?.id === type.id && "btn-primary")}
				>
					{type.name}
				</button>
			))}

			{/*{false === isLoading && (*/}
			{/*	<button*/}
			{/*		onClick={handleUIEvent(() => navigationStack.next({ key: "type:new" }))}*/}
			{/*		className="mb-2 btn btn-dash btn-block h-12 justify-start"*/}
			{/*	>*/}
			{/*		Add a new type*/}
			{/*		<Plus className="ml-auto size-4" />*/}
			{/*	</button>*/}
			{/*)}*/}
		</PageLayout>
	);
}
