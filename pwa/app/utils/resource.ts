import type { Iri } from "~t/types";

/**
 * Extract the ID contained in an Iri (the last part of the path)
 */
export function extractId(iri?: Iri): string | undefined {
	if (undefined === iri) {
		return undefined;
	}

	return iri.substring(iri.lastIndexOf("/") + 1);
}
