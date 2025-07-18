import type { Volume, Weight } from "~/utils/value-objects/units";
import type { TeawareType } from "./teawareType";
import type Steep from "~/utils/value-objects/Steep";

export type Id = number;
export type Iri = string;

interface Resource {
	id: Id;
	"@id": Iri;
	"@type": string;
}

type LTreePath = string[];

export type User = Resource & {
	username: string;
};

export type TeaType = Resource & {
	name: string;
	path: string;
};

export type Cultivar = Resource & {
	name: string;
};

export type Origin = Resource & {
	name: string;
	path: LTreePath;
};

export type Tea = Resource & {
	family: TeaFamily;
	type?: TeaType;
	origin?: Origin;
	originPath?: { country: Origin; region: Origin | null; locality: Origin | null };
	displayName: string;
};

export type TeaTypeTreeNode = TeaType & LTreeNode;
export type OriginTreeNode = Origin & LTreeNode;

export interface LTreeNode {
	path: string;
	children?: LTreeNode[];
}

export type Teaware = Resource & {
	type: TeawareType;
	name: string;
	volume?: Volume;
};

export type BrewingSession = Resource & {
	tea: Tea;
	teaware?: Teaware;
	teaQuantity?: Weight;
	steeps: Steep[];
	createdAt: Date;
};

export const teaFamilies = {
	white: "White tea",
	yellow: "Yellow tea",
	green: "Green tea",
	wulong: "Wulong tea",
	black: "Black tea",
	fermented: "Fermented tea",
} as const;

export type TeaFamily = keyof typeof teaFamilies;

export interface ApiCollection<T> {
	"@context": string;
	"@id": string;
	"@type": "Collection";
	totalItems: number;
	member: T[];
}
