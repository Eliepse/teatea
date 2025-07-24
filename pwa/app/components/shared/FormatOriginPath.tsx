import type { OriginPath } from "~t/types";

export function FormatOriginPath(props: { originPath: OriginPath }) {
	if (undefined !== props.originPath.locality) {
		return `${props.originPath.locality.name}, ${props.originPath.region.name} (${props.originPath.country.name})`;
	}

	if (undefined !== props.originPath.region) {
		return `${props.originPath.region.name} (${props.originPath.country.name})`;
	}

	return props.originPath.country.name;
}
