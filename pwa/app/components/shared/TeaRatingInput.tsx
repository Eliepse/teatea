import { Star, StarSolid } from "iconoir-react";
import clsx from "clsx";
import { useState } from "react";

const VALUES = [1, 2, 3, 4, 5] as const;
type Value = (typeof VALUES)[number];

export function TeaRatingInput(props: {
	value: number | null | undefined;
	onChange: (value: Value) => void;
	readonly?: boolean;
	className?: string;
}) {
	const [hover, setHover] = useState<Value | undefined>();
	const value = props.readonly ? props.value : (hover ?? props.value);

	function change(value: Value) {
		if (props.readonly) {
			return;
		}

		props.onChange(value);
	}

	return (
		<div className={clsx("flex flex-nowrap", props.className)}>
			{VALUES.map((id) => (
				<button
					key={id}
					className="px-2 cursor-pointer text-green-600"
					onMouseEnter={() => setHover(id)}
					onMouseLeave={() => setHover(undefined)}
					onClick={() => change(id)}
				>
					{!!value && value >= id ? <StarSolid className="size-10" /> : <Star className="size-10" />}
				</button>
			))}
		</div>
	);
}
