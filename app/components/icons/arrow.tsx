const path = {
	up: "M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18",
	right: "M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3",
	down: "M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3",
	left: "M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18",
};

export default function Arrow(props: { direction: "up" | "right" | "down" | "left"; className?: string }) {
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
