import clsx from "clsx";
import { useUser } from "~/auth/hooks/useUser";
import { XCircleIcon } from "@heroicons/react/16/solid";
import { handleUIEvent } from "~/utils/function";

export function SessionsUserFilter(props: {
	username: string | undefined;
	onChange: (username: string | undefined) => void;
	className?: string;
}) {
	const user = useUser();
	const isFilterSelf = user.data?.username === props.username;

	if (false === isFilterSelf && !!props.username) {
		return (
			<div className={clsx("h-12 flex pr-0 btn btn-soft btn-primary", props.className)}>
				<span>{props.username}</span>
				<button className="ml-auto cursor-pointer self-stretch p-4" onClick={handleUIEvent(() => props.onChange(undefined))}>
					<XCircleIcon className="size-4" />
				</button>
			</div>
		);
	}

	return (
		<div className={clsx("join flex bg-white", props.className)}>
			<button
				className={clsx("join-item h-12 btn btn-soft flex-1", isFilterSelf ? "btn-primary" : "bg-white")}
				onClick={() => props.onChange(user?.data?.username)}
			>
				Me
			</button>
			<button
				className={clsx("join-item h-12 btn btn-soft flex-1", !isFilterSelf ? "btn-primary" : "bg-white")}
				onClick={() => props.onChange(undefined)}
			>
				Everyone
			</button>
		</div>
	);
}
