import { type RoastLevel, RoastLevelEnum } from "~t/types";

export function RoastLevelLabel(props: { roast?: RoastLevel; showNotRoasted?: boolean }) {
	if ("no" === props.roast) {
		return true === props.showNotRoasted ? "Not roasted" : null;
	}

	if ("yes" === props.roast) {
		return "Roasted";
	}

	if("light" === props.roast) {
		return "Light roast"
	}

	if("mild" === props.roast) {
		return "Mild roast"
	}

	if("strong" === props.roast) {
		return "Strong roast"
	}

	return null;
}
