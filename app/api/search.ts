import { Client } from "pg";
import type { Route } from "../+types/root";
import knex from "knex";

function getPgClient(): Client {
	return new Client({});
}

function knexConnection() {
	return knex({
		client: "pg",
		debug: true,
		connection: {
			host: "localhost",
			user: "admin",
			password: "admin",
			database: "teatea",
			port: 2345,
		},
	});
}

export async function loader(args: Route.LoaderArgs) {
	const connection = knexConnection();

	// const client = getPgClient();
	// await client.connect();

	const qb = connection
		.select("tea.*", "cultivar.name as cultivar_name")
		.from("tea")
		.leftJoin("cultivar", "tea.cultivar_id", "cultivar.id")
		.orderBy("tea.id");

	let joinsClauses = [];
	const whereClauses = [];
	const searchTypes = new URL(args.request.url).searchParams.getAll("type[]").map((id) => parseInt(id));
	const searchOrigins = new URL(args.request.url).searchParams.getAll("origin[]").map((id) => parseInt(id));

	if (0 < searchTypes.length) {
		qb.innerJoin("tea_type as TFilter", "tea.type_id", "TFilter.id");
		qb.andWhereRaw(`"TFilter".path <@ ANY (SELECT path FROM tea_type t WHERE t.id IN (${searchTypes.join(",")}))`);
	}

	if (0 < searchOrigins.length) {
		qb.innerJoin("origin as OFilter", "tea.origin_id", "OFilter.id");
		qb.andWhereRaw(`"OFilter".path <@ ANY (SELECT path FROM origin o WHERE o.id IN (${searchOrigins.join(",")}))`);
	}

	const rawTeas = await qb.limit(100);

	if (0 === rawTeas.length) {
		return [];
	}

	const originsId = rawTeas.reduce((ids, tea) => (ids.includes(tea.origin_id) ? ids : [...ids, tea.origin_id]), []);
	const typesId = rawTeas.reduce((ids, tea) => (ids.includes(tea.type_id) ? ids : [...ids, tea.type_id]), []);

	const originResults = await connection
		.select("origin.id", connection.raw("array_agg(tmp.name ORDER BY tmp.path) as names"))
		.from("origin")
		.leftJoin("origin as tmp", "tmp.path", "@>", "origin.path")
		.whereIn("origin.id", originsId)
		.groupBy("origin.id");

	const typeResults = await connection
		.select("tea_type.id", connection.raw("array_agg(tmp.name ORDER BY tmp.path) as names"))
		.from("tea_type")
		.leftJoin("tea_type as tmp", "tmp.path", "@>", "tea_type.path")
		.whereIn("tea_type.id", typesId)
		.groupBy("tea_type.id");

	const origins = originResults.reduce((store, item) => ({ ...store, [item.id]: item }), {});
	const types = typeResults.reduce((store, item) => ({ ...store, [item.id]: item }), {});

	const teas = rawTeas.map((tea) => {
		const origin = origins[tea.origin_id]?.names ?? [];
		const type = types[tea.type_id]?.names ?? [];

		return {
			...tea,
			origin: origin
				? {
						country: origin[1],
						region: origin[2],
						locality: origin[3],
					}
				: null,
			type: {
				category: type[0],
				family: type[1],
				type: type[2],
				subType: type[3],
			},
		};
	});

	await connection.destroy();

	return teas;
}
