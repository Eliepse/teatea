import { PageLayout } from "~/components/shared/paged/PageLayout";
import { type TeaType } from "~t/types";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { useTeaTypes } from "~/utils/api/useTeaTypes";
import { handleUIEvent } from "~/utils/function";
import Arrow from "~/components/icons/arrow";
import { ArrowRightIcon, PlusIcon } from "@heroicons/react/24/outline";

type Filters = Parameters<typeof useTeaTypes>[0];

export function SelectType(props: {
	onBack: () => void;
	onSelect: (value: TeaType) => void;
	onCreate?: () => void;
	onSkip?: () => void;
	defaultValue?: TeaType;
	filters?: Filters;
}) {
	const { data: types, isLoading } = useTeaTypes({ ...props.filters, itemsPerPage: 50 });
	const [selected, setSelected] = useState(props.defaultValue);

	const hasTypes = !isLoading && 0 < (types?.member?.length ?? 0);

	// Group by levels to display same country, same region, same locality
	const typesByLevel = useMemo(() => {
		const origin = props.filters?.origin;

		if (undefined === origin || !types) {
			return { country: [], region: [], locality: [] };
		}

		return types.member.reduce(
			(groups, type) => {
				const path = type.origin.path;
				const pathNodes = origin.split(".");

				if (3 === pathNodes.length && origin === path) {
					groups.locality.push(type);
					return groups;
				}

				if (2 === pathNodes.length && path.startsWith(pathNodes.slice(0, 2).join("."))) {
					groups.region.push(type);
					return groups;
				}

				groups.country.push(type);
				return groups;
			},
			{ country: [], region: [], locality: [] } as { country: TeaType[]; region: TeaType[]; locality: TeaType[] },
		);
	}, [types, props.filters?.origin]);

	function toggleType(type: TeaType) {
		setSelected((st) => (st === type ? undefined : type));
	}

	function confirm() {
		if (undefined === selected) {
			return;
		}

		props.onSelect(selected);
	}

	return (
		<PageLayout
			title="Is it one of the following type?"
			onBack={props.onBack}
			bodyClassName="pb-4"
			action={
				<button
					className="ml-auto btn btn-primary"
					onClick={handleUIEvent(confirm)}
					disabled={!selected || isLoading}
				>
					Next
					<Arrow direction="right" className="size-4 ml-1" />
				</button>
			}
		>
			{props.onSkip && (
				<button
					className="btn btn-block btn-outline btn-secondary justify-between h-12 mb-4"
					onClick={handleUIEvent(props.onSkip)}
				>
					I don't know the type of this tea <ArrowRightIcon className="size-4" />
				</button>
			)}

			{props.onCreate && (
				<button
					className="btn btn-block btn-dash justify-between h-12 mb-4"
					onClick={handleUIEvent(props.onCreate)}
				>
					Add a new type (not listed) <PlusIcon className="size-4" />
				</button>
			)}

			{!hasTypes && <p className="py-4 text-center italic text-base-content/60">No types found</p>}
			{isLoading && (
				<div className="mb-8">
					<div className="skeleton h-14 mb-2" />
					<div className="skeleton h-14 mb-2" />
					<div className="skeleton h-14 mb-2" />
				</div>
			)}

			{!props.filters?.origin &&
				types?.member?.map((type) => (
					<TypeItem
						key={type.id}
						label={type.name}
						onClick={() => toggleType(type)}
						selected={selected?.["@id"] === type["@id"]}
					/>
				))}

			{props.filters?.origin && 0 < typesByLevel.locality.length && (
				<div className="mb-8">
					<div className="text-xs text-base-content/60 mb-2 uppercase tracking-wide">Same locality</div>
					{typesByLevel.locality.map((type) => (
						<TypeItem
							key={type.id}
							label={type.name}
							onClick={() => toggleType(type)}
							selected={selected?.["@id"] === type["@id"]}
							isPDO={type.isPDO}
						/>
					))}
				</div>
			)}

			{props.filters?.origin && 0 < typesByLevel.region.length && (
				<div className="mb-8">
					<div className="text-xs text-base-content/60 mb-2 uppercase tracking-wide">Same region</div>
					{typesByLevel.region.map((type) => (
						<TypeItem
							key={type.id}
							label={type.name}
							onClick={() => toggleType(type)}
							selected={selected?.["@id"] === type["@id"]}
							isPDO={type.isPDO}
						/>
					))}
				</div>
			)}

			{props.filters?.origin && 0 < typesByLevel.country.length && (
				<div className="mb-8">
					<div className="text-xs text-base-content/60 mb-2 uppercase tracking-wide">Same country</div>
					{typesByLevel.country.map((type) => (
						<TypeItem
							key={type.id}
							label={type.name}
							onClick={() => toggleType(type)}
							selected={selected?.["@id"] === type["@id"]}
							isPDO={type.isPDO}
						/>
					))}
				</div>
			)}
		</PageLayout>
	);
}

function TypeItem(props: { label: string; onClick: () => void; selected?: boolean; isPDO?: boolean }) {
	return (
		<button
			onClick={handleUIEvent(props.onClick)}
			className={clsx("mb-2 btn btn-block h-12 justify-start font-normal", props.selected && "btn-primary")}
		>
			{props.label}
			{props.isPDO && <span className="ml-auto text-sm italic text-base-content/60">Protected origin</span>}
		</button>
	);
}
