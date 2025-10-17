import { Duration, Temperature, type Volume, type Weight } from "~/utils/value-objects/units";
import type { TeawareType } from "./teawareType";

export type Id = number;
export type Iri = string;

export interface Resource<TType extends string = string> {
	id: Id;
	"@id": Iri;
	"@type": TType;
}

export type User = Resource & {
	username: string;
	roles?: string[];
};

export type MemberStats = Resource & {
	statsSessionsTotal: number;
	statsConsumedTeasTotal: number;
	statsTopTeas: Tea[];
};

export type TeaType = Resource<"TeaType"> & {
	family: TeaFamily;
	name: string;
	origin: Pick<Origin, "@id" | "@type" | "path">;
	isPDO: boolean;
};

export type Cultivar = Resource<"Cultivar"> & {
	name: string;
};

export type TreePath = string;

export type Origin = Omit<Resource, "id"> & {
	name: string;
	path: TreePath;
	isLeaf?: boolean;
	proposal?: boolean;
};

export type OriginPath = {
	"@type": "OriginPath";
	country: Origin;
} & ({ region: Origin; locality?: Origin } | { region: Origin; locality: Origin });

export type Tea = Resource & {
	family: TeaFamily;
	displayName: string;
	type?: TeaType;
	origin?: Origin;
	originPath?: OriginPath;
	cultivar?: Cultivar;
	year?: number;
	addedAt: Date;
};

export type TeaSession = Resource<"TeaSession"> & {
	tea: Tea;
	note?: string;
	teaQuantity?: number;
	waterMl?: number;
	quality?: BrewingQuality;
	drankAt: Date;
	author?: Iri | Member;
	steeps?: Steep[];
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

export type Member = Resource<"Member"> & {
	username: string;
	email: string;
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

export interface ApiPaginatedCollection<T> extends ApiCollection<T> {
	view: {
		"@id": string;
		"@type": string;
		first: string;
		last: string;
		previous?: string;
		next?: string;
	};
}

export type SearchResult = {
	label: string;
	score?: number;
};

export type TeaStats = Pick<Resource<"TeaStats">, "@type" | "@id"> & {
	teaId: number;
	sessionsCount: number;
	authorsCount: number;
};

export type Steep = Omit<Resource<"Steep">, "id"> & {
	key: string;
	duration: Duration;
	temperature?: Temperature;
	order: number;
};

export const BrewingQualityEnum = {
	Good: 2,
	Improvable: 0,
	Bad: -2,
} as const;

export type BrewingQuality = (typeof BrewingQualityEnum)[keyof typeof BrewingQualityEnum];

export const TeaListTypeEnum = {
	Custom: 0,
	Favorites: 1,
	Wishlist: 2,
} as const;

export type TeaListType = (typeof TeaListTypeEnum)[keyof typeof TeaListTypeEnum];

export type TeaList = Resource<"TeaList"> & {
	name: string;
	owner: Iri;
};

export type MemberTea = Resource & {
	id: Id;
	tea: Tea;
	list?: Iri;
	type: TeaListType;
	author: Iri;
	createdAt: Date;
};
