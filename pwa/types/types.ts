import { Duration, Temperature, type Volume } from "~/utils/value-objects/units";
import type { TeawareType } from "./teawareType";

export type Id = number;
export type Iri = string;

export type Embed<R extends Resource, K extends string, E> = Omit<R, K> & { [key in K]: E };

export type NullablePartial<T> = {
	[P in keyof T]?: T[P] | null;
};

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
	statsConsumedTeaKgTotal: number;
	statsTopTeas: Tea[];
	statsTopTeaTypes: TeaType[];
};

export type TeaType = Resource<"TeaType"> & {
	slug: string;
	family: TeaFamily;
	name: string;
	origin: Origin;
	isPDO: boolean;
	stats?: {
		rank: number;
		teasCount: number;
		sessionsCount: number;
	};
};

export type Cultivar = Resource<"Cultivar"> & {
	name: string;
};

export type TreePath = string;

export type Origin = Omit<Resource<"Origin">, "id"> & {
	name: string;
	namePath: string[];
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
	roast?: RoastLevel;
	business?: Business;
	addedAt: Date;
};

export type TeaSession = Resource<"TeaSession"> & {
	tea: Tea;
	collectionTea: Iri;
	note?: string;
	teaQuantity?: number;
	waterMl?: number;
	quality?: BrewingQuality;
	drankAt: Date;
	author?: Iri;
	steeps?: Steep[];
	place?: Business;
	brewingType?: BrewingType;
};

export type Steep = {
	duration: Duration;
	temperature?: Temperature;
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

export type Member = Resource<"Member"> & {
	username: string;
	email: string;
	friendshipped_at?: Date;
	friendship_requested?: boolean;
	friendship_rejected?: boolean;
};

export type Friend = Pick<Member, "@id" | "@type" | "username">;
export type Friendship = Resource<"Friendship"> & {
	requestor: Pick<Member, "@id" | "@type" | "username">;
	requestedAt?: Date;
};

export type TeaFamily = "white" | "yellow" | "green" | "wulong" | "black" | "fermented";

export const teaFamilies: Record<TeaFamily, string> = {
	white: "White tea",
	yellow: "Yellow tea",
	green: "Green tea",
	wulong: "Wulong tea",
	black: "Black tea",
	fermented: "Fermented tea",
};

export const teaFamiliesShort = {
	white: "White",
	yellow: "Yellow",
	green: "Green",
	wulong: "Wulong",
	black: "Black",
	fermented: "Fermented",
} as const;

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

export const BrewingQualityEnum = {
	Good: 2,
	Improvable: 0,
	Bad: -2,
} as const;

export const BrewingTypeEnum = {
	Cold: "cold",
	Hot: "hot",
} as const;

export type BrewingQuality = (typeof BrewingQualityEnum)[keyof typeof BrewingQualityEnum];
export type BrewingType = (typeof BrewingTypeEnum)[keyof typeof BrewingTypeEnum];

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

export const RoastLevelEnum = {
	No: "no",
	Yes: "yes",
	Light: "light",
	Mild: "mild",
	Strong: "strong",
} as const;

export type RoastLevel = (typeof RoastLevelEnum)[keyof typeof RoastLevelEnum];

export type Business = Resource<"Business"> & {
	name: string;
};

export type MediaObject = Resource<"MediaObject"> & {
	contentUrl: string;
	collection?: string;
	placeholder?: string;
};

export type CollectionTea = Resource<"CollectionTea"> & {
	tea: Tea;
	owner: Iri;
	description?: string;
	acquiredAt?: Date;
	finishedAt?: Date;
	thumbnail?: MediaObject;
	rating?: number;
};
