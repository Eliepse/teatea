import clsx from "clsx";

export function Confirmation(props: {
	state: "idle" | "pending" | "success" | "error",
	error?: string,
	onBack: () => void,
	onOk: () => void,
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

		{"success" === props.state && (
			<button className="btn btn-wide btn-primary mb-4" onClick={props.onOk}>See the tea</button>
		)}

		{"pending" !== props.state && (
			<button className="btn btn-wide" onClick={props.onBack}>Close</button>
		)}
	</div>
}
