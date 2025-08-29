import type { OriginPath } from "~t/types";

export function FormatOriginPath(props: { originPath: OriginPath; maxLevel?: "country" | "region" | "locality" }) {
	if (undefined !== props.originPath.locality && !["region", "country"].includes(props.maxLevel ?? "locality")) {
		return `${props.originPath.locality.name}, ${props.originPath.region.name} (${props.originPath.country.name})`;
	}

	if (undefined !== props.originPath.region && "country" !== props.maxLevel) {
		return `${props.originPath.region.name} (${props.originPath.country.name})`;
	}

	return props.originPath.country.name;
}
