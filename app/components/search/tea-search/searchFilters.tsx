import MagnifierIcon from "~/components/icons/magnifier";
import { TypeFilterListAll } from "../TypeFilterListAll";
import { useEffect, useState, type ChangeEvent } from "react";
import { OriginFilter } from "../OriginFilter";
import type { Origin, OriginTreeNode, TeaType, TeaTypeTreeNode } from "~t/types";
import { useQuery } from "@tanstack/react-query";

export type FilterValue = {
	types?: TeaType[];
	origins?: Origin[];
	text?: string;
};

async function filtersData(): Promise<{
	types: { [key: string]: TeaTypeTreeNode };
	origins: OriginTreeNode[];
}> {
	return (await fetch("/api/filters")).json();
}

export function SearchFilters(props: { value: FilterValue; onChange(filters: FilterValue): void }) {
	const { data, isSuccess } = useQuery({
		queryKey: ["search", "filters"],
		queryFn: filtersData,
	});

	function onTextSearchChange(value?: string) {
		props.onChange({ ...props.value, text: value });
	}

	function onTypeChange(types: TeaType[]) {
		props.onChange({ ...props.value, types: 0 !== types.length ? types : undefined });
	}

	function onOriginChange(origins: Origin[]) {
		props.onChange({ ...props.value, origins: 0 !== origins.length ? origins : undefined });
	}

	return (
		<div className="p-4 flex-none">
			<label className="input mr-2 mb-2 flex-1">
				<MagnifierIcon className="h-[1em] opacity-50" />
				<SearchInput onChange={onTextSearchChange} disabled={!isSuccess} />
			</label>

			<div className="">
				<TypeFilterListAll
					types={data?.types?.Tea?.children ?? []}
					value={props.value.types ?? []}
					onChange={onTypeChange}
					disabled={!isSuccess}
				/>
				<OriginFilter
					origins={data?.origins ?? []}
					value={props.value.origins ?? []}
					onChange={onOriginChange}
					disabled={!isSuccess}
				/>
			</div>
		</div>
	);
}

function SearchInput(props: {
	initialValue?: string;
	onChange: (value: string | undefined) => void;
	delay?: number;
	disabled?: boolean;
}) {
	const [value, setValue] = useState<string | undefined>(props.initialValue);

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		e.stopPropagation();
		const value = e.currentTarget.value.trim().toLowerCase();
		setValue(value || undefined);
	}

	useEffect(() => {
		const to = setTimeout(() => props.onChange(value), props.delay ?? 500);
		return () => clearTimeout(to);
	}, [value]);

	return (
		<input type="search" className="grow" placeholder="Search" onChange={handleChange} disabled={props.disabled} />
	);
}
