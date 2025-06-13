import { useFetcher } from "react-router";
import { TeaFamilyInput } from "~/components/tea/input/TeaFamilyInput";
import type { Route } from "./+types/create-type";

export async function clientAction({ request }: Route.ClientActionArgs) {
	const data = await request.formData();

	const response = await fetch(import.meta.env.PUBLIC_API_URL + "/tea_types", {
		method: "POST",
		headers: { "Content-Type": "application/ld+json", Accept: "application/ld+json" },
		body: JSON.stringify({
			family: data.get("family"),
			name: data.get("name"),
		}),
	});

	return await response.json();
}

export default function CreateType() {
	const fetcher = useFetcher();
	const busy = "idle" !== fetcher.state;

	return (
		<div>
			<h1 className="p-4 border-b border-base-200">Create a new type</h1>
			<fetcher.Form method="POST" className="p-4">
				<fieldset className="fieldset mb-4">
					<legend className="fieldset-legend">Family</legend>
					<TeaFamilyInput defaultValue="" name="family" className="w-full" required />
				</fieldset>

				<fieldset className="fieldset mb-4">
					<legend className="fieldset-legend">Name</legend>
					<input type="text" name="name" className="input w-full" required />
				</fieldset>

				<button type="submit" disabled={busy} className="btn btn-primary btn-block">
					{busy ? "Saving..." : "Create"}
				</button>
			</fetcher.Form>
		</div>
	);
}
