import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router";
import clsx from "clsx";

export function BackButton(props: { withLabel?: boolean; className?: string }) {
	const navigate = useNavigate();

	return (
		<button
			className={clsx(
				"btn btn-lg bg-white",
				props.withLabel ? "rounded-full text-base" : "btn-circle",
				props.className,
			)}
			onClick={() => navigate(-1)}
			aria-label={true !== props.withLabel ? "Go back" : undefined}
		>
			<ArrowLeftIcon className={props.withLabel ? "size-5" : "size-6"} />
			{true === props.withLabel && "Go back"}
		</button>
	);
}
