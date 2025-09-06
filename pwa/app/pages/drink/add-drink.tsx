import { useNavigate } from "react-router";
import { CreateDrinkFlow } from "~/components/drink/CreateDrinkFlow";
import type { Route } from "../../../.react-router/types/app/pages/drink/+types/add-drink";
import { getApi } from "~/utils/api";
import { denormalizeTea, type TeaRaw } from "~/utils/api/normalization/tea";

export async function clientLoader(args: Route.ClientLoaderArgs) {
	const url = new URL(args.request.url);
	const rawTeaId = url.searchParams.get("tea");
	const teaId = rawTeaId ? parseInt(rawTeaId) : null;

	if (teaId && 0 < teaId) {
		const payload = await (await getApi<TeaRaw>(`/teas/${teaId}`)).json();
		return { tea: denormalizeTea(payload) };
	}

	return {};
}

export default function LogDrinkPage(props: Route.ComponentProps) {
	const navigate = useNavigate();
	return <CreateDrinkFlow tea={props.loaderData.tea} onBack={() => navigate(-1)} />;
}
