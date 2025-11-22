import type { Iri, Origin } from "~t/types";
import { OriginSelect } from "~/components/origin/OriginSelect";
import { Modal } from "~/components/shared/modal/Modal";
import { type PropsWithChildren, useState } from "react";
import { ArrowLeft, Check } from "iconoir-react";
import { useResourceQuery } from "~/utils/api/useResourceQuery";
import { handleUIEvent } from "~/utils/function";
import clsx from "clsx";

export function OriginSelectModal(props: {
	open: boolean;
	onClose: () => void;
	onSelect: (value?: Iri) => void;
	defaultValue?: Iri;
	allowToggle?: boolean;
}) {
	const [value, setValue] = useState<Iri | undefined>(props.defaultValue);
	const [filterPath, setFilterPath] = useState<string | undefined>();
	const { data: filterOrigin, isLoading } = useResourceQuery<Origin>(
		filterPath ? `/api/origins/${filterPath}` : undefined,
	);

	function handleFilterPathChange(path: string | undefined) {
		setFilterPath(path);
		setValue(undefined);
	}

	function handleReturn() {
		if (undefined === filterPath) {
			setValue(undefined);
			props.onClose();
			return;
		}

		const nodes = filterPath.split(".");
		setFilterPath(1 < nodes.length ? nodes.slice(0, -1).join(".") : undefined);
	}

	return (
		<Modal open={props.open} position="bottom" onClose={props.onClose} className="h-full p-0">
			<div className="sticky top-0 flex justify-between items-center mb-4 pb-4 border-b border-green-200 bg-white px-4 pt-4">
				<Button onClick={handleReturn}>
					<ArrowLeft className="size-4" />
				</Button>

				<Button onClick={() => props.onSelect(value)} disabled={!props.allowToggle && !value}>
					Done <Check className="size-4 ml-2" />
				</Button>
			</div>

			<div className="text-2xl font-header px-6 mb-6 text-center">
				{isLoading && <div className="skeleton w-24 h-8 mx-auto" />}
				{!isLoading && (filterOrigin?.namePath?.join(", ") ?? "Countries")}
			</div>

			<OriginSelect
				onChange={(iri) => setValue(iri)}
				value={value}
				filterPath={filterPath}
				onFilterPathChange={handleFilterPathChange}
				allowToggle
				className="px-6 mb-6"
			/>
		</Modal>
	);
}

function Button(props: PropsWithChildren<{ className?: string; onClick: () => void; disabled?: boolean }>) {
	return (
		<button
			className={clsx(
				"flex items-center px-6 h-12 border border-green-500 text-green-900 rounded-xl",
				!props.disabled && "hover:bg-green-200 focus:bg-green-200 active:bg-green-500 active:text-white",
				props.disabled ? "cursor-not-allowed" : "cursor-pointer",
				"disabled:border-stone-100 disabled:text-stone-400",
			)}
			onClick={handleUIEvent(props.onClick)}
			disabled={props.disabled}
		>
			{props.children}
		</button>
	);
}
