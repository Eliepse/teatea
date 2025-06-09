import type { TeawareType } from "./teawareType";

type ID = number;

interface WithId {
	id: ID;
}

export namespace DB {
	export type Tea = WithId & {
		name: string | null;
		type_id: ID;
		origin_id: ID | null;
		cultivar_id: ID | null;
		blend: boolean | null;
		harvest: object | null;
		smoked: boolean | null;
		roast_level: number | null;
		scented: boolean | null;
		altitude: number | null;
	};

	export type Origin = WithId & {
		name: string;
		path: string;
	};

	export type TeaType = WithId & {
		name: string;
		path: string;
	};

	export type Teaware = WithId & {
		type: TeawareType;
		name: string;
		volume_ml: number | null;
	};

	export type BrewingSession = WithId & {
		tea_id: number;
		teaware_id?: number;
		tea_quantity?: number;
		created_at: Date;
	};
}
