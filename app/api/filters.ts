import { Client } from "pg";
import type { Route } from "../+types/root";
import { knexConnection } from "~/api/search";

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
	const itemsByPath = Object.fromEntries(list.map(item => [item.path, item]));

	const treeEntries = Object.entries(itemsByPath).map(([path, item]) => {
		const parentPath = path.substring(0, path.lastIndexOf("."));
		const parent = Object.hasOwn(itemsByPath, parentPath) ? itemsByPath[parentPath] : null;

		if (!parent) {
			return [path, item];
		}

		if (!parent.children) {
			parent.children = [];
		}

		parent.children.push(item);
		return [path, undefined];
	});

	return Object.fromEntries(treeEntries.filter(([,v]) => undefined !== v));
}

export async function loader(args: Route.LoaderArgs) {
	const cnx = knexConnection();

	const origins = await cnx.select("origin.*").from("origin").orderBy("path");
	const types = await cnx.select("tea_type.*").from("tea_type").orderBy("order", "path");

	await cnx.destroy();

	return {
		origins: Object.values(pathToTree(origins)),
		types: pathToTree(types),
	};
}
