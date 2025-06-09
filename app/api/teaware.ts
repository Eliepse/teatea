import { knexConnection } from "~/utils/db";
import type { DB } from "~t/database";

export async function loader(): Promise<DB.Teaware[]> {
	const cnx = knexConnection();

	const teawares = await cnx
		.select("t.id as t_id", "t.type as t_type", "t.name as t_name", "t.volume_ml as t_volume_ml")
		.from("teaware as t");

	await cnx.destroy();

	return teawares.map((row) => ({
		id: row.t_id,
		type: row.t_type,
		name: row.t_name,
		volume_ml: row.t_volume_ml || undefined,
	}));
}
