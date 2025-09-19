import { Duration, Temperature } from "~/utils/value-objects/units";
import { handleUIEvent } from "~/utils/function";
import { PencilIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export function SteepCard(props: { duration: Duration; temperature?: Temperature; order: number; editable?: boolean }) {
	const [edit, setEdit] = useState(false);

	const duration = [
		0 < props.duration.hours && `${props.duration.hours} h`,
		0 < props.duration.minutes && `${props.duration.minutes} min`,
		0 < props.duration.seconds && `${props.duration.seconds} s`,
	]
		.filter((s) => !!s)
		.join(" ");

	return (
		<div className="flex bg-base-200 px-2 pl-6 h-12 items-center rounded-md">
			<span className="flex-none text-xl text-base-content/60">{props.order}</span>
			<div className="ml-auto font-mono flex items-center">
				<span className="inline-block px-3">{duration}</span>
				<span className="inline-block w-18 px-3 border-l border-gray-400">{`${props.temperature?.deg ?? "-"}°C`}</span>
			</div>
			{props.editable && (
				<button
					className="flex-none h-full btn btn-ghost btn-sm ml-4"
					onClick={handleUIEvent(() => setEdit(true))}
				>
					<PencilIcon className="size-4 text-base-content/60" />
				</button>
			)}
		</div>
	);
}
