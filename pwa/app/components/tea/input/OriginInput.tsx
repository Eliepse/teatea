import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import type { ChangeEvent } from "react";
import { fetchApi } from "~/utils/api";

async function fetchTypes(): Promise<{ id: number; path: string; name: string }[]> {
	const data = await (await fetchApi("/origins")).json();
	return data.member ?? [];
}

type Value = number;

export function OriginInput(props: {
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
		queryKey: ["origins"],
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

					{data.map((origin) => {
						const levels = origin.path.split(".");
						const isCountry = 1 === levels.length;
						const isLocality = 3 === levels.length;

						return (
							<option
								key={origin.id}
								value={origin.id}
								className={clsx(isCountry && "bg-accent", isLocality && "text-base-content/70")}
							>
								{levels
									.slice(1)
									.map((_) => " ")
									.join("")}
								{origin.name}
							</option>
						);
					})}
				</>
			)}
		</select>
	);
}

// export function OriginInput(props: { origins: { name: string; path: string; id: number }[] }) {
// 	return (
// 		<select className="select" name="origin" defaultValue="">
// 			<option value="">Unknown</option>

// 			{props.origins.map((origin) => {
// 				const levels = origin.path.split(".");
// 				const isCountry = 1 === levels.length;
// 				const isLocality = 3 === levels.length;

// 				return (
// 					<option
// 						key={origin.id}
// 						value={origin.id}
// 						className={clsx(isCountry && "bg-accent", isLocality && "text-base-content/70")}
// 					>
// 						{levels
// 							.slice(1)
// 							.map((i) => " ")
// 							.join("")}
// 						{origin.name}
// 					</option>
// 				);
// 			})}
// 		</select>
// 	);
// }
