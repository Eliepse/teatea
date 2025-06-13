import type { Volume, Weight } from "~/utils/value-objects/units";
import type { TeawareType } from "./teawareType";
import type Steep from "~/utils/value-objects/Steep";

interface Entity {
	id: number;
}

export type TeaType = Entity & {
	name: string;
	path: string;
};

export type Cultivar = Entity & {
	name: string;
};

export type Origin = Entity & {
	name: string;
	path: string;
};

export type Tea = Entity & {
	name?: string;
	type: TeaType;
	// All the tree of this tea type
	parentTypes: TeaType[];
	cultivar?: Cultivar;
	origin?: Origin;
	// All the tree of this tea origin
	parentOrigins?: Origin[];
};

export type TeaTypeTreeNode = TeaType & LTreeNode;
export type OriginTreeNode = Origin & LTreeNode;

export interface LTreeNode {
	path: string;
	children?: LTreeNode[];
}

export type Teaware = Entity & {
	type: TeawareType;
	name: string;
	volume?: Volume;
};

export type BrewingSession = Entity & {
	tea: Tea;
	teaware?: Teaware;
	teaQuantity?: Weight;
	steeps: Steep[];
	createdAt: Date;
};
