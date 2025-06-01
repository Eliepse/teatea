import type { Route } from "./+types/home";
import { Client } from "pg";
import clsx from "clsx";
import { Form, useFetcher } from "react-router";
import { Fragment } from "react";

export function meta({}: Route.MetaArgs) {
	return [{ title: "Teatea - Add" }];
}

function getPgClient(): Client {
	return new Client({
		user: "admin",
		password: "admin",
		database: "teatea",
		port: 2345,
	});
}

export async function loader() {
	const client = getPgClient();
	await client.connect();

	const { rows: types } = await client.query("SELECT * FROM tea_type ORDER BY path");
	const { rows: origins } = await client.query("SELECT * FROM origin ORDER BY path");
	const { rows: cultivars } = await client.query(
		"SELECT cultivar.*, origin.name as origin FROM cultivar " +
			"LEFT JOIN origin ON cultivar.origin_id = origin.id " +
			"ORDER BY cultivar.origin_id, cultivar.name",
	);

	await client.end();

	return {
		types,
		origins,
		cultivars: cultivars.reduce((countries, cultivar) => {
			if (!countries[cultivar.origin]) {
				countries[cultivar.origin] = {
					name: cultivar.origin,
					cultivars: [],
				};
			}

			countries[cultivar.origin].cultivars.push(cultivar);

			return countries;
		}, {}),
	};
}

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();

	const client = getPgClient();
	await client.connect();

	const harvest = {} as { year?: number; month?: number; season?: string };

	if (formData.get("harvest.year")) {
		harvest["year"] = parseInt(formData.get("harvest.year") as string);
	}

	if (formData.get("harvest.month")) {
		harvest["month"] = parseInt(formData.get("harvest.month") as string);
	}

	if (formData.get("harvest.season")) {
		harvest["season"] = formData.get("harvest.season") as string;
	}

	const roast = formData.get("roasted") || null;

	const res = await client.query({
		text: `
            INSERT INTO tea (type_id, origin_id, cultivar_id, name, harvest, altitude, blend, roast_level)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
            `,
		values: [
			formData.get("type"),
			formData.get("origin") || null,
			formData.get("cultivar") || null,
			formData.get("name") || null,
			0 !== Object.keys(harvest).length ? harvest : null,
			formData.get("altitude") || null,
			formData.get("cultivar") ? false : null,
			formData.get("roasted") || null,
		],
	});

	client.end();

	return res.rows[0];
}

export default function CreateForm(props: Route.ComponentProps) {
	const fetcher = useFetcher();
	const busy = fetcher.state !== "idle";

	return (
		<fetcher.Form className="max-w-md mx-auto py-6" method="POST">
			<label className="select mb-4 w-100">
				<span className="label">Type</span>
				<TypeInput types={props.loaderData.types} />
			</label>

			<label className="select mb-4 w-100">
				<span className="label">Origin</span>
				<OriginInput origins={props.loaderData.origins} />
			</label>

			<label className="select mb-4 w-100">
				<span className="label">Cultivar</span>
				<CultivarsInput values={props.loaderData.cultivars} />
			</label>

			<fieldset className="fieldset mb-4">
				<legend className="fieldset-legend">Name</legend>
				<input className="input w-100" placeholder="Unknown" name="name" />
			</fieldset>

			<fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-100 border p-4 mb-4 ">
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
				<input className="input w-100" placeholder="Unknown" pattern="[0-9]+" name="altitude" />
			</fieldset>

			<label className="select mb-4 w-100">
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

function OriginInput(props: { origins: { name: string; path: string; id: number }[] }) {
	return (
		<select className="select" name="origin" defaultValue="">
			<option value="">Unknown</option>

			{props.origins.map((origin) => {
				const levels = origin.path.split(".");
				const isCountry = 1 === levels.length;
				const isLocality = 3 === levels.length;

				return (
					<option
						key={origin.id}
						value={origin.id}
						className={clsx(isCountry && "bg-accent", isLocality && "text-base-content/70")}
					>
						{levels
							.slice(1)
							.map((i) => " ")
							.join("")}
						{origin.name}
					</option>
				);
			})}
		</select>
	);
}

function TypeInput(props: { types: { name: string; path: string; id: number }[] }) {
	return (
		<select className="select" name="type" defaultValue="" required>
			<option value="">Unknown</option>

			{props.types.map((type) => {
				const levels = type.path.split(".");
				const isTop = 2 === levels.length;
				const isSubType = 4 === levels.length;

				return (
					<option
						key={type.id}
						value={type.id}
						className={clsx(isTop && "bg-accent", isSubType && "text-base-content/70")}
					>
						{levels
							.slice(2)
							.map((i) => " ")
							.join("")}
						{type.name}
					</option>
				);
			})}
		</select>
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
