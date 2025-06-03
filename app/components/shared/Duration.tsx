import type { Duration } from "~/utils/value-objects/units";

export function FormattedDuration(props: { duration: Duration; type?: "clock" | "text" }) {
	if ("text" === props.type) {
		return (
			props.duration.hours.toFixed().padStart(2, "0") +
			" h " +
			props.duration.minutes.toFixed().padStart(2, "0") +
			" min " +
			props.duration.seconds.toFixed().padStart(2, "0") +
			" s"
		);
	}

	return (
		props.duration.hours.toFixed().padStart(2, "0") +
		":" +
		props.duration.minutes.toFixed().padStart(2, "0") +
		":" +
		props.duration.seconds.toFixed().padStart(2, "0")
	);
}
