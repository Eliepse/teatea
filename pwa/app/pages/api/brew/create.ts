import type { Route } from ".react-router/types/app/+types/root";
import { knexConnection } from "~/utils/db";

export async function action(args: Route.ActionArgs): Promise<{ id: number }> {
	const cnx = knexConnection();

	const form = (await args.request.json()) as { tea_id: number; teaware_id?: number; quantity?: number };

	const brewingSession = await cnx
		.insert({
			tea_id: form.tea_id,
			teaware_id: form.teaware_id,
			tea_quantity: form.quantity,
			created_at: new Date(),
		})
		.into("brewing_session")
		.returning("id");

	await cnx.destroy();

	return { id: brewingSession[0].id };
}
