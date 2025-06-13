import { knexConnection } from "~/utils/db";
import type { BrewingSession } from "~t/types";
import { Duration, Temperature, Volume, Weight } from "~/utils/value-objects/units";
import { useNavigate } from "react-router";
import Chevron from "~/components/icons/chevron";
import type { Route } from "./+types/brewing-edit";
import { useState } from "react";
import dayjs from "dayjs";
import Leaf from "~/components/icons/leaf";
import { teawareTypes, type TeawareType } from "~t/teawareType";
import { Modal } from "~/components/shared/modal/Modal";
import { SteepForm } from "~/components/brewing/SteepForm";
import Steep from "~/utils/value-objects/Steep";
import { useMutation } from "@tanstack/react-query";
import { FormattedDuration } from "~/components/shared/FormattedDuration";

export function meta() {
	return [{ title: "Teatea - Brew" }];
}

export async function loader(args: Route.LoaderArgs): Promise<
	Omit<BrewingSession, "tea" | "teaware"> & {
		tea: {
			id: number;
			name?: string;
			type: {
				name: string;
			};
			cultivar?: {
				name: string;
			};
		};
		teaware?: {
			id: number;
			type: TeawareType;
			name: string;
			volume: number;
		};
		steeps?: {
			id: number;
			duration: number;
			temperature: number;
			volume_ml?: number;
		}[];
	}
> {
	const knex = knexConnection();

	const bsId = args.params.id;
	const rows = await knex
		.select(
			// Brewing session
			"bs.id as bs_id",
			"bs.tea_quantity as bs_quantity",
			"bs.created_at as bs_created_at",
			// Tea
			"t.id as t_id",
			"t.name as t_name",
			"t.origin_id as t_origin_id",
			"t.type_id as t_type_id",
			"t.cultivar_id as t_cultivar_id",
			// Tea type
			"tt.name as tt_name",
			// Cultivar
			"c.name as c_name",
			// Teaware
			"tw.id as tw_id",
			"tw.type as tw_type",
			"tw.name as tw_name",
			"tw.volume_ml as tw_volume",
			// Steeps
			"steep.id as s_id",
			"steep.duration as s_duration",
			"steep.temperature as s_temperature",
			"steep.volume_ml as s_volume_ml",
		)
		.leftJoin("tea as t", "bs.tea_id", "t.id")
		.leftJoin("teaware as tw", "bs.teaware_id", "tw.id")
		.leftJoin("tea_type as tt", "t.type_id", "tt.id")
		.leftJoin("cultivar as c", "t.cultivar_id", "c.id")
		.leftJoin("brewing_steep as steep", "bs.id", "steep.brewing_session_id")
		.from("brewing_session as bs")
		.where("bs.id", bsId);
	await knex.destroy();

	const data = rows[0];

	let teaware;

	if (data.tw_id) {
		teaware = {
			id: data.tw_id,
			type: data.tw_type,
			name: data.tw_name,
			volume: data.tw_volume,
		};
	}

	const steeps = rows
		.filter((r) => !!r.s_id)
		.map((row) => ({
			id: row.s_id,
			duration: row.s_duration,
			temperature: row.s_temperature,
			volume_ml: row.s_volume_ml || undefined,
		}));

	return {
		id: data.bs_id,
		teaQuantity: data.bs_quantity,
		createdAt: data.bs_created_at,
		tea: {
			id: data.t_id,
			name: data.t_name ?? undefined,
			type: {
				name: data.tt_name,
			},
			cultivar: data.c_name
				? {
						name: data.c_name,
					}
				: undefined,
		},
		teaware,
		steeps,
	};
}

async function persistSteep(args: { bs_id: number; duration: number; temperature: number; volume_ml?: number }) {
	const response = await fetch(`/api/brew/${args.bs_id}/steep`, {
		method: "POST",
		body: JSON.stringify(args),
	});

	const data = await response.json();

	return { ...data, ...args };
}

function prepareBrew(
	data: Route.ComponentProps["loaderData"],
): Omit<BrewingSession, "tea"> & { tea: Route.ComponentProps["loaderData"]["tea"] } {
	return {
		...data,
		teaQuantity: data.teaQuantity ? Weight.fromG(data.teaQuantity) : undefined,
		teaware: data.teaware
			? {
					...data.teaware,
					volume: data.teaware?.volume ? Volume.fromMl(data.teaware.volume) : undefined,
				}
			: undefined,
		steeps: prepareSteeps(data.steeps ?? []),
	};
}

function prepareSteeps(steeps: Route.ComponentProps["loaderData"]["steeps"]): Steep[] {
	return (
		steeps?.map(
			(steep) =>
				new Steep(
					Duration.fromSeconds(steep.duration),
					new Temperature(steep.temperature),
					steep.volume_ml ? Volume.fromMl(steep.volume_ml) : undefined,
					steep.id,
				),
		) ?? []
	);
}

export default function BrewingEdit(props: Route.ComponentProps) {
	const brew = prepareBrew(props.loaderData);
	const navigate = useNavigate();
	const [mode, setMode] = useState<"edit" | "read">("read");
	const [steepFormOpen, setSteepFormOpen] = useState(false);
	const [steeps, setSteeps] = useState<Steep[]>(brew.steeps);
	const lastSteep = steeps.slice(-1)[0];

	const createSteep = useMutation({
		mutationFn: persistSteep,
		onSuccess: (data: { id: number }) => {
			setSteepFormOpen(false);
			setSteeps((st) => [...st, ...prepareSteeps([data])]);
		},
	});

	function saveSteep(steep: Steep) {
		createSteep.mutate({
			bs_id: brew.id,
			duration: steep.duration.totalSeconds,
			temperature: steep.temperature.degrees,
			volume_ml: steep.water?.ml,
		});
	}

	if (undefined === brew) {
		return "Loading...";
	}

	return (
		<div>
			<header className="p-4 border-b border-base-300">
				<nav className="flex mb-6">
					<button className="btn btn-ghost px-0" onClick={() => navigate(-1)}>
						<Chevron direction="left" className="size-4" /> Back
					</button>

					{"edit" === mode && (
						<button className="btn btn-primary rounded-full ml-auto" onClick={() => setMode("read")}>
							Confirm
						</button>
					)}

					{"read" === mode && (
						<button className="btn rounded-full ml-auto" onClick={() => setMode("edit")}>
							Edit
						</button>
					)}
				</nav>

				<h1 className="mb-2">
					<span className="uppercase text-xs text-base-content/60">
						{dayjs(brew.createdAt).format("D MMM YYYY")}
					</span>
					<br />
					<span className="text-2xl">{brew.tea.name ?? brew.tea.type.name}</span>
				</h1>

				<ul className="flex gap-2">
					{brew.tea.name && <li className="badge badge-sm badge-soft badge-primary">{brew.tea.type.name}</li>}
					{brew.tea.cultivar?.name && (
						<li className="badge badge-sm badge-soft badge-success">
							<Leaf className="size-3" />
							{brew.tea.cultivar?.name}
						</li>
					)}
					{brew.teaQuantity && (
						<li className="badge badge-sm badge-soft badge-primary">{brew.teaQuantity.g} g</li>
					)}
				</ul>
			</header>

			{brew.teaware && (
				<p className="px-4 py-2 border-b border-base-300">
					<span className="text-xs text-base-content/60">
						{teawareTypes[brew.teaware.type]} &middot; {brew.teaware?.volume?.ml} ml
					</span>
					<br />
					{brew.teaware.name}
				</p>
			)}

			<div className="p-4">
				{!!steeps.length && (
					<ul className="mb-4">
						{steeps.map((steep, i) => (
							<li
								key={steep.id}
								className="flex items-center gap-2 py-2 px-4 h-12 bg-base-200 rounded-lg mb-2 text-sm leading-none"
							>
								<div className="font-mono text-3xl text-base-content/40 -my-1">{i + 1}</div>
								<div className="flex-1 px-4">
									{steep.temperature.deg} °C
									{steep.water && ` - ${steep.water.ml} ml`}
								</div>
								<div className="font-mono text-right text-base">
									<FormattedDuration duration={steep.duration} type="text" skipEmpty />
								</div>
							</li>
						))}
					</ul>
				)}

				<div className="text-center">
					<button className="btn btn-dash btn-secondary btn-wide" onClick={() => setSteepFormOpen(true)}>
						Add a steep
					</button>
				</div>
			</div>

			<Modal open={steepFormOpen} onClose={() => setSteepFormOpen(false)} position="bottom" backdrop>
				<SteepForm
					initVolume={lastSteep?.water ?? brew.teaware?.volume}
					initDegrees={lastSteep?.temperature}
					onSubmit={saveSteep}
				/>
			</Modal>
		</div>
	);
}
