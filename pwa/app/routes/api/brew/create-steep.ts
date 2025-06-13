import { knexConnection } from "~/utils/db";
import type { Route } from "./+types/create-steep";

export async function action(args: Route.ActionArgs): Promise<{ id: number }> {
	const cnx = knexConnection();
	const bs_id = parseInt(args.params.id);

	if (bs_id < 0) {
		throw new Error("Wrong ID");
	}

	const form = (await args.request.json()) as { duration: number; temperature: number; volume_ml?: number };

	const rows = await cnx
		.insert({
			brewing_session_id: bs_id,
			duration: form.duration,
			temperature: form.temperature,
			volume_ml: form.volume_ml,
		})
		.into("brewing_steep")
		.returning("*");

	await cnx.destroy();
	console.debug(rows);
	const steep = rows[0];
	return { id: steep.id };
}
