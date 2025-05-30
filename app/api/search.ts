import type { Route } from "../+types/root";
import knex, { type Knex } from "knex";
import type { Tea } from "~t/types";
import type { DB } from "~t/database";
import { format } from "path";
import { unique } from "~/utils/array";

export function knexConnection() {
	return knex({
		client: "pg",
		connection: {
			host: "localhost",
			user: "admin",
			password: "admin",
			database: "teatea",
			port: 2345,
		},
	});
}

export async function loader(args: Route.LoaderArgs): Promise<Tea[]> {
	const cnx = knexConnection();

	const requestUrl = new URL(args.request.url);
	let searchTypes = requestUrl.searchParams.getAll("type[]").map((id) => parseInt(id));
	let searchOrigins = requestUrl.searchParams.getAll("origin[]").map((id) => parseInt(id));
	const textSearch = requestUrl.searchParams.get("q") || null;

	const filterIds = {
		teas: [] as number[],
		cultivars: [] as number[],
		types: [] as number[],
		origins: [] as number[],
	};

	if (textSearch) {
		const quotedSearch = textSearch.replaceAll(/[_%\\]/g, "\\$&");

		const textSearchResults = await cnx.raw(
			`
				SELECT T.id as id, 'teas' as type FROM tea T
				WHERE T.name @@ :search OR T.name ILIKE :searchLike
			UNION ALL
				SELECT C.id as id, 'cultivars' as type FROM cultivar C
				WHERE C.name @@ :search OR C.name ILIKE :searchLike
			UNION ALL
				SELECT DISTINCT TT.id as id, 'types' as type FROM tea_type TT
				WHERE TT.name @@ :search OR TT.name ILIKE :searchLike
			UNION ALL
				SELECT DISTINCT O.id as id, 'origins' as type FROM origin O
				WHERE O.name @@ :search OR O.name ILIKE :searchLike
			LIMIT 1000
			`,
			{ search: textSearch, searchLike: `%${quotedSearch}%` },
		);

		textSearchResults.rows.forEach((row: { id: number; type: "teas" | "cultivars" | "types" | "origins" }) => {
			filterIds[row.type].push(row.id);
		});
	}

	const teasQuery = cnx
		.select(
			// Tea
			"tea.id as t_id",
			"tea.name as t_name",
			"tea.origin_id as t_origin_id",
			"tea.type_id as t_type_id",
			"tea.cultivar_id as t_cultivar_id",
			// Cultivar
			"c.id as c_id",
			"c.name as c_name",
			// Tea type
			"tt.id as tt_id",
			"tt.name as tt_name",
			"tt.path as tt_path",
			// Origin
			"o.id as o_id",
			"o.name as o_name",
			"o.path as o_path",
		)
		.from("tea")
		.leftJoin("cultivar as c", "tea.cultivar_id", "c.id")
		.leftJoin("tea_type as tt", "tea.type_id", "tt.id")
		.leftJoin("origin as o", "tea.origin_id", "o.id")
		.orderBy("tea.id");

	if (0 !== searchTypes.length || 0 !== filterIds.types.length) {
		const typesIds = unique([...searchTypes, ...filterIds.types]);

		teasQuery.innerJoin("tea_type as TFilter", "tea.type_id", "TFilter.id");
		teasQuery.andWhereRaw(
			`"TFilter".path <@ ANY (SELECT path FROM tea_type t WHERE t.id IN (${typesIds.join(",")}))`,
		);
	}

	if (0 !== searchOrigins.length || 0 !== filterIds.origins.length) {
		const originIds = unique([...searchOrigins, ...filterIds.origins]);

		teasQuery.innerJoin("origin as OFilter", "tea.origin_id", "OFilter.id");
		teasQuery.andWhereRaw(
			`"OFilter".path <@ ANY (SELECT path FROM origin o WHERE o.id IN (${originIds.join(",")}))`,
		);
	}

	if (Object.values(filterIds).some((v) => 0 !== v.length)) {
		teasQuery.andWhere((qb) => {
			if (0 !== filterIds.teas.length) {
				qb.orWhereIn("tea.id", filterIds.teas);
			}

			if (0 !== filterIds.cultivars.length) {
				qb.orWhereIn("c.id", filterIds.cultivars);
			}
		});
	}

	console.debug(teasQuery.toString());

	const results = await teasQuery.limit(100);

	if (0 === results.length) {
		return [];
	}

	const types = await fetchTypes(cnx, extractPaths(results, "tt_path"));
	const origins = await fetchOrigins(cnx, extractPaths(results, "o_path"));

	await cnx.destroy();

	return results.map((row): Tea => {
		const origin = origins[row.o_path];

		return {
			id: row.t_id,
			name: row.t_name ?? undefined,
			type: { id: row.tt_id, name: row.tt_name, path: row.tt_path },
			parentTypes: findLTreeParents(types, row.tt_path),
			cultivar: row.c_id ? { id: row.c_id, name: row.c_name } : undefined,
			origin: origin ?? undefined,
			parentOrigins: origin ? findLTreeParents(origins, origin.path) : undefined,
		};
	});
}

function extractPaths(list: object[], key: string): string[] {
	return list.reduce<string[]>((paths, item) => {
		if (false === Object.hasOwn(item, key)) {
			return paths;
		}

		// @ts-ignore
		const path = typeof item[key] === "string" ? item[key] : undefined;

		if (!path || paths.includes(path)) {
			return paths;
		}

		return [...paths, path];
	}, []);
}

async function fetchTypes(cnx: Knex, paths: string[]): Promise<{ [key: string]: DB.TeaType }> {
	if (0 === paths.length) {
		return {};
	}

	// .select("origin.id", connection.raw("array_agg(tmp.name ORDER BY tmp.path) as names"))
	const results: DB.TeaType[] = await cnx
		.select("*")
		.from("tea_type")
		.where("tea_type.path", "@>", cnx.raw(makeLTreeArray(paths)));

	return Object.fromEntries(results.map((row) => [row.path, row]));
}

async function fetchOrigins(cnx: Knex, paths: string[]): Promise<{ [key: string]: DB.Origin }> {
	if (0 === paths.length) {
		return {};
	}

	// .select("origin.id", connection.raw("array_agg(tmp.name ORDER BY tmp.path) as names"))
	const results: DB.Origin[] = await cnx
		.select("*")
		.from("origin")
		.where("origin.path", "@>", cnx.raw(makeLTreeArray(paths)));
	return Object.fromEntries(results.map((row) => [row.path, row]));
}

function makeLTreeArray(paths: string[]): string {
	const items = paths.map((path) => `'${path}'::ltree`);
	return `(ARRAY[${items.join(",")}])`;
}

function findLTreeParents<T>(list: { [key: string]: T }, path: string): T[] {
	const paths: string[] = [];

	path.split(".")
		.slice(0, -1)
		.reduce<string[]>((p, n) => {
			paths.push([...p, n].join("."));
			return [...p, n];
		}, []);

	return paths.map((k) => list[k]).filter((v) => !!v);
}
