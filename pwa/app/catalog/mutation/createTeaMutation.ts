import type { Iri, RoastLevel } from "~t/types";
import type { NewOrigin } from "~/components/origin/OriginSelect";
import { mutationOptions } from "@tanstack/react-query";
import { postApi } from "~/utils/api";
import { denormalizeTea, type TeaRaw } from "~/utils/api/normalization/tea";
import { extractId } from "~/utils/resource";
import type { NewBusiness } from "~/catalog/components/business/BusinessSelect";

export interface NewTeaData {
	type: Iri;
	origin?: Iri | NewOrigin;
	business?: Iri | NewBusiness;
	cultivar?: Iri;
	year?: number;
	roast?: RoastLevel;
}

type NewTeaPayload = {
	type: Iri;
	origin?: Iri | { name: string; parentPath?: string };
	business?: Iri | { name: string };
	cultivar?: Iri;
	year?: number;
	roast?: RoastLevel;
};

export function makeCreateTeaMutationOpt() {
	return mutationOptions({
		mutationFn: async (data: NewTeaData) => {
			const res = await postApi<TeaRaw>("/api/teas", {
				type: data.type,
				origin: extractOrigin(data.origin),
				business: extractBusiness(data.business),
				cultivar: data.cultivar,
				year: data.year,
				roast: data.roast,
			} satisfies NewTeaPayload);
			return denormalizeTea(await res.json());
		},
	});
}

function extractOrigin(data: NewTeaData["origin"]): NewTeaPayload["origin"] {
	if (typeof data === "string") {
		return data;
	}

	return data ? { name: data.name, parentPath: extractId(data.parent) } : undefined;
}

function extractBusiness(data: NewTeaData["business"]): NewTeaPayload["business"] {
	if (typeof data === "string") {
		return data;
	}

	return data ? { name: data.name } : undefined;
}
