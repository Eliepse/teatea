import type { Volume, Weight } from "~/utils/value-objects/units";
import type { TeawareType } from "./teawareType";
import type Steep from "~/utils/value-objects/Steep";

export type Id = number;
export type Iri = string;

interface Resource<TType extends string = string> {
	id: Id;
	"@id": Iri;
	"@type": TType;
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

export type OriginPath = {
	"@type": "OriginPath";
	country: Origin;
} & ({ region: Origin; locality?: Origin } | { region: Origin; locality: Origin });

export type Tea = Resource & {
	family: TeaFamily;
	type?: TeaType;
	origin?: Origin;
	originPath?: OriginPath;
	displayName: string;
};

export type Drink = Resource<"Drink"> & {
	tea: Tea;
	note?: string;
	teaQuantity?: number;
	waterMl?: number;
	drankAt: Date;
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
