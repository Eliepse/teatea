import type { Iri, RoastLevel, TeaFamily } from "~t/types";
import type { NewOrigin } from "~/components/origin/OriginSelect";
import { mutationOptions } from "@tanstack/react-query";
import { postApi } from "~/utils/api";
import { denormalizeTea, type TeaRaw } from "~/utils/api/normalization/tea";
import { extractId } from "~/utils/resource";
import type { NewBusiness } from "~/catalog/components/business/BusinessSelect";
import type { NewCultivar } from "~/catalog/components/cultivar/CultivarSelect";
import type { NewType } from "~/catalog/components/teaType/TypeSelect";

export interface NewTeaData {
	type: Iri | NewType;
	origin?: Iri | NewOrigin;
	business?: Iri | NewBusiness;
	cultivar?: Iri | NewCultivar;
	year?: number;
	roast?: RoastLevel;
}

type NewTeaPayload = {
	type: Iri | { name: string; family: TeaFamily };
	origin?: Iri | { name: string; parentPath?: string };
	business?: Iri | { name: string };
	cultivar?: Iri | { name: string };
	year?: number;
	roast?: RoastLevel;
};

export function makeCreateTeaMutationOpt() {
	return mutationOptions({
		mutationFn: async (data: NewTeaData) => {
			const res = await postApi<TeaRaw>("/api/teas", {
				type: extractType(data.type),
				origin: extractOrigin(data.origin),
				business: extractBusiness(data.business),
				cultivar: extractCultivar(data.cultivar),
				year: data.year,
				roast: data.roast,
			} satisfies NewTeaPayload);
			return denormalizeTea(await res.json());
		},
	});
}

function extractType(data: NewTeaData["type"]): NewTeaPayload["type"] {
	if (typeof data === "string") {
		return data;
	}

	return { name: data.name, family: data.family };
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

function extractCultivar(data: NewTeaData["cultivar"]): NewTeaPayload["cultivar"] {
	if (typeof data === "string") {
		return data;
	}

	return data ? { name: data.name } : undefined;
}
