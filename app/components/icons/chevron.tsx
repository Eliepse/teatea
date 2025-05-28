const path = {
	up: "m4.5 15.75 7.5-7.5 7.5 7.5",
	right: "m8.25 4.5 7.5 7.5-7.5 7.5",
	down: "m19.5 8.25-7.5 7.5-7.5-7.5",
	left: "M15.75 19.5 8.25 12l7.5-7.5",
};

export default function Chevron(props: { direction: "up" | "right" | "down" | "left"; className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth="1.5"
			stroke="currentColor"
			className={props.className}
		>
			<path strokeLinecap="round" strokeLinejoin="round" d={path[props.direction]} />
		</svg>
	);
}
