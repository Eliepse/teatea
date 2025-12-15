import type { Origin, OriginPath } from "~t/types";

type OriginLevel = "country" | "region" | "locality";

export function FormatOriginPath(props: { originPath: OriginPath; maxLevel?: OriginLevel }) {
	if (undefined !== props.originPath.locality && !["region", "country"].includes(props.maxLevel ?? "locality")) {
		return `${props.originPath.locality.name}, ${props.originPath.region.name} (${props.originPath.country.name})`;
	}

	if (undefined !== props.originPath.region && "country" !== props.maxLevel) {
		return `${props.originPath.region.name} (${props.originPath.country.name})`;
	}

	return props.originPath.country.name;
}

export function FormatOrigin(props: { origin: Pick<Origin, "namePath">; maxLevel?: OriginLevel }) {
	const [country, region, locality] = props.origin.namePath;

	if (undefined !== country && !["region", "country"].includes(props.maxLevel ?? "locality")) {
		return `${locality}, ${region} (${country})`;
	}

	if (undefined !== region && "country" !== props.maxLevel) {
		return `${region} (${country})`;
	}

	return country;
}
