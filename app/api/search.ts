import type { Route } from "../+types/root";
import knex, { type Knex } from "knex";
import type { Tea } from "~t/types";
import type { DB } from "~t/database";

export function knexConnection() {
	return knex({
		client: "pg",
		connection: {
			host: "localhost",
			user: "admin",
			password: "admin",
			database: "teatea",
			port: 2345
		}
	});
}

export async function loader(args: Route.LoaderArgs): Promise<Tea[]> {
	const cnx = knexConnection();
	const requestUrl = new URL(args.request.url);

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
			"o.path as o_path"
		)
		.from("tea")
		.leftJoin("cultivar as c", "tea.cultivar_id", "c.id")
		.leftJoin("tea_type as tt", "tea.type_id", "tt.id")
		.leftJoin("origin as o", "tea.origin_id", "o.id")
		.orderBy("tea.id");

	const searchTypes = requestUrl.searchParams.getAll("type[]").map((id) => parseInt(id));
	const searchOrigins = requestUrl.searchParams.getAll("origin[]").map((id) => parseInt(id));

	if (0 < searchTypes.length) {
		teasQuery.innerJoin("tea_type as TFilter", "tea.type_id", "TFilter.id");
		teasQuery.andWhereRaw(`"TFilter".path <@ ANY (SELECT path FROM tea_type t WHERE t.id IN (${searchTypes.join(",")}))`);
	}

	if (0 < searchOrigins.length) {
		teasQuery.innerJoin("origin as OFilter", "tea.origin_id", "OFilter.id");
		teasQuery.andWhereRaw(`"OFilter".path <@ ANY (SELECT path FROM origin o WHERE o.id IN (${searchOrigins.join(",")}))`);
	}
	
	const textSearch = requestUrl.searchParams.get("q") || null;

	if(!!textSearch) {
		teasQuery.andWhere((qb) => {
			const quotedSearch = textSearch.replaceAll(/[_%\\]/g, "\\$&");
			qb.orWhereRaw("tea.name ILIKE ?", [`%${quotedSearch}%`])
			.orWhereRaw("c.name ILIKE ?", [`%${quotedSearch}%`])
			.orWhereRaw("tt.name ILIKE ?", [`%${quotedSearch}%`])
		});
	}
	
	const results = await teasQuery.limit(100);

	if (0 === results.length) {
		return [];
	}

	const originsPaths: string[] = results.reduce(
		(paths, r) => (!!r.tt_path || paths.includes(r.tt_path) ? paths : [...paths, r.tt_path]),
		[]
	);

	const typesPaths: string[] = results.reduce(
		(paths, r) => (!!r.o_path || paths.includes(r.o_path) ? paths : [...paths, r.o_path]),
		[]
	);

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
			parentOrigins: origin ? findLTreeParents(origins, origin.path) : undefined
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

	path.split(".").slice(0, -1).reduce<string[]>((p, n) => {
		paths.push([...p, n].join("."));
		return [...p, n];
	}, []);

	return paths.map((k) => list[k]).filter((v) => !!v);
}
