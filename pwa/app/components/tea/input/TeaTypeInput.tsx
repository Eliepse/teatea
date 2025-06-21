import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import type { ChangeEvent } from "react";
import { fetchApi } from "~/utils/api";

async function fetchTypes(): Promise<{ id: number; family: string; name: string }[]> {
	const data = await (await fetchApi("/tea_types")).json();
	return data.member ?? [];
}

type Value = number;

export function TeaTypeInput(props: {
	name?: string;
	defaultValue?: Value | "";
	value?: Value | string;
	onChange?: (value: Value | "") => void;
	required?: boolean;
	disabled?: boolean;
	className?: string;
}) {
	const { data, isLoading } = useQuery({
		queryFn: fetchTypes,
		queryKey: ["tea_types"],
	});

	function handleChange(e: ChangeEvent<HTMLSelectElement>) {
		if (!props.onChange) {
			return;
		}

		e.stopPropagation();
		e.preventDefault();

		props.onChange(parseInt(e.currentTarget.value));
	}

	return (
		<select
			className="select"
			name="type"
			defaultValue=""
			required={props.required}
			disabled={props.disabled || isLoading}
			onChange={handleChange}
		>
			{isLoading && (
				<option value="" disabled>
					Loading...
				</option>
			)}

			{false === isLoading && !!data && (
				<>
					<option
						value=""
						disabled={props.required}
						className={clsx(props.disabled && "text-base-content/60")}
					>
						Unknown
					</option>
					{data.map((type) => {
						return (
							<option
								key={type.id}
								value={type.id}
								// className={clsx(isTop && "bg-accent", isSubType && "text-base-content/70")}
							>
								[{type.family}] {type.name}
							</option>
						);
					})}
				</>
			)}
		</select>
	);
}
