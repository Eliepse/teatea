import { Client } from "pg";
import type { Route } from "../+types/root";

type DBOrigin = {
	id: number;
	path: string;
	name: string;
};

function getPgClient(): Client {
	return new Client({
		user: "admin",
		password: "admin",
		database: "teatea",
		port: 2345,
	});
}

function pathToTree(list: any[]): { [key: string]: { children?: any[] } } {
	return list.reduce((store, item) => {
		const parentPath = item.path.split(".").slice(0, -1).join(".");
		const parent = Object.hasOwn(store, parentPath) ? store[parentPath] : null;

		store[item.path] = item;

		if (!parent) {
			return store;
		}

		if (!parent.children) {
			parent.children = [];
		}

		parent.children.push(item);
		return store;
	}, {});
}

export async function loader(args: Route.LoaderArgs) {
	const client = getPgClient();
	await client.connect();

	const originResults = await client.query<DBOrigin>(`SELECT id, name, path FROM origin ORDER BY path`);
	const typeResults = await client.query(`SELECT id, name, path FROM tea_type ORDER BY path`);

	const types = Object.entries(pathToTree(typeResults.rows))
		.filter(([path]) => false === path.includes("."))
		.map(([_, item]) => item);

	await client.end();

	return {
		origins: pathToTree(originResults.rows)["Top"].children,
		types: types,
	};
}
