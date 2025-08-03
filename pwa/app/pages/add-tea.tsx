import { useFetcher } from "react-router";
import { Fragment } from "react";
import { TeaTypeInput } from "~/components/tea/input/TeaTypeInput";
import { OriginInput } from "~/components/tea/input/OriginInput";
import { Route } from "../../.react-router/types/app/pages/tea/+types/tea-create";

export function meta() {
	return [{ title: "Teatea - Add" }];
}

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();
	return null;
}

export default function CreateForm(props: Route.ComponentProps) {
	const fetcher = useFetcher();
	const busy = fetcher.state !== "idle";

	return (
		<fetcher.Form className="max-w-md mx-auto p-4" method="POST">
			<label className="select mb-4">
				<span className="label">Type</span>
				<TeaTypeInput name="type" required />
			</label>

			<label className="select mb-4">
				<span className="label">Origin</span>
				<OriginInput name="origin" required />
			</label>

			<label className="select mb-4">
				<span className="label">Cultivar</span>
				{/* <CultivarsInput values={props.loaderData.cultivars} /> */}
			</label>

			<fieldset className="fieldset mb-4">
				<legend className="fieldset-legend">Name</legend>
				<input className="input" placeholder="Unknown" name="name" />
			</fieldset>

			<fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4 mb-4 ">
				<legend className="fieldset-legend">Harvest</legend>

				<label className="select w-auto">
					<span className="label">Year</span>
					<select name="harvest.year">
						<option value="">Unknown</option>
						{Array(10)
							.fill(1)
							.map((_, i) => (
								<option key={2025 - i} value={2025 - i}>
									{2025 - i}
								</option>
							))}
					</select>
				</label>

				<label className="select w-auto">
					<span className="label">Month</span>
					<select name="harvest.month">
						<option value="">None</option>
						<option value={1}>January</option>
						<option value={2}>February</option>
						<option value={3}>March</option>
						<option value={4}>April</option>
						<option value={5}>May</option>
						<option value={6}>June</option>
						<option value={7}>July</option>
						<option value={8}>August</option>
						<option value={9}>September</option>
						<option value={10}>October</option>
						<option value={11}>November</option>
						<option value={12}>December</option>
					</select>
				</label>

				<label className="select w-auto">
					<span className="label">Season</span>
					<select name="harvest.season" defaultValue="">
						<option value="">None</option>
						<option value="spring">Spring</option>
						<option value="summer">Summer</option>
						<option value="fall">Fall</option>
						<option value="winter">Winter</option>
					</select>
				</label>
			</fieldset>

			<fieldset className="fieldset mb-4">
				<legend className="fieldset-legend">Altitude</legend>
				<input className="input" placeholder="Unknown" pattern="[0-9]+" name="altitude" />
			</fieldset>

			<label className="select mb-4">
				<span className="label">Roasted</span>
				<select name="roasted">
					<option value="">No</option>
					<option value={1}>Yes</option>
					<option value={2}>light</option>
					<option value={3}>mild</option>
					<option value={4}>strong</option>
				</select>
			</label>

			<button type="submit" className="btn btn-primary btn-block" disabled={busy}>
				{busy ? "Saving..." : "Add tea"}
			</button>
		</fetcher.Form>
	);
}

function CultivarsInput(props: {
	values: { [key: string]: { name: string; cultivars: { id: string; name: string }[] } };
}) {
	return (
		<select className="select" name="type" defaultValue="">
			<option value="">Unknown</option>

			{Object.values(props.values).map((country) => (
				<Fragment key={country.id}>
					<option className="text-base-content/40" disabled>
						{country.name}
					</option>
					{country.cultivars.map((cultivar) => (
						<option key={cultivar.id} value={cultivar.id}>
							&emsp;{cultivar.name}
						</option>
					))}
				</Fragment>
			))}
		</select>
	);
}
