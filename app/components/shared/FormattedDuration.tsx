import { Duration } from "~/utils/value-objects/units";

export function FormattedDuration(props: { duration: Duration; type?: "clock" | "text"; skipEmpty?: boolean }) {
	const skip = {
		hours: props.skipEmpty && props.duration.totalHours < 1,
		minutes: props.skipEmpty && props.duration.totalMinutes < 1,
		seconds: props.skipEmpty && props.duration.totalSeconds < 1,
	};

	const parts = {
		hours: props.duration.hours.toFixed().padStart("text" !== props.type ? 2 : 0, "0"),
		minutes: props.duration.minutes.toFixed().padStart("text" !== props.type ? 2 : 0, "0"),
		seconds: props.duration.seconds.toFixed().padStart("text" !== props.type ? 2 : 0, "0"),
	};

	if ("text" === props.type) {
		return (
			<>
				{!skip.hours && `${parts.hours} h `}
				{!skip.minutes && `${parts.minutes} min `}
				{!skip.seconds && `${parts.seconds} s`}
			</>
		);
	}

	return (
		<>
			{!skip.hours && `${parts.hours}:`}
			{!skip.minutes && `${parts.minutes}:`}
			{!skip.seconds && parts.seconds}
		</>
	);
}
