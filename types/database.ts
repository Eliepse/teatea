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
	}

	export type TeaType = WithId & {
		name: string;
		path: string;
	}
}
