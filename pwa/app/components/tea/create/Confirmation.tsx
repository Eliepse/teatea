import clsx from "clsx";
import { handleUIEvent } from "~/utils/function";

export function Confirmation(props: {
	state: "idle" | "pending" | "success" | "error",
	error?: string,
	onBack?: () => void,
	onOk?: () => void,
	okText?: string
}) {
	return <div className={clsx("h-full flex flex-col justify-center items-center")}>
		{"pending" === props.state && (
			<div>Saving the new tea...</div>
		)}

		{"error" === props.state && (
			<div className="my-8">Could not save the tea!</div>
		)}

		{"success" === props.state && (
			<div className="my-8">New tea added!</div>
		)}

		{"success" === props.state && !!props.onOk && (
			<button className="btn btn-wide mb-4" onClick={handleUIEvent(props.onOk)}>
				{props.okText ?? "Ok"}
			</button>
		)}

		{"pending" !== props.state && !!props.onBack && (
			<button className="btn btn-wide" onClick={handleUIEvent(props.onBack)}>Back</button>
		)}
	</div>
}
