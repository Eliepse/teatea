import { SteepForm } from "~/components/brewing/SteepCounter";
import type { Route } from "./+types/home";
import { useState } from "react";
import { FormattedDuration } from "~/components/shared/Duration";
import type Steep from "~/utils/value-objects/Steep";
import { Modal } from "~/components/shared/modal/Modal";

export function meta({}: Route.MetaArgs) {
	return [{ title: "Teatea" }];
}

export default function Home(props: Route.ComponentProps) {
	const [steeps, setSteeps] = useState<Steep[]>([]);
	const [steepFormOpen, setSteepFormOpen] = useState(false);
	const lastSteep = steeps.slice(-1)[0] ?? undefined;

	function handleSteepDone(steep: Steep) {
		setSteeps((vs) => [...vs, steep]);
		setSteepFormOpen(false);
	}

	return (
		<div className="p-4">
			{steeps.map((steep, i) => (
				<div key={i} className="h-16 flex items-center justify-between font-mono">
					<div className="mx-4">
						<div>Steep {i + 1}</div>
						<div className="text-sm text-base-content/70">
							{steep.temperature.deg} °C {steep.water && `- ${steep.water.ml} ml`}
						</div>
					</div>

					<div className="text-lg mr-5">
						<FormattedDuration duration={steep.duration} />
					</div>
				</div>
			))}

			<button className="btn btn-dash btn-block mt-6" onClick={() => setSteepFormOpen(true)}>
				Add a steep
			</button>

			<Modal open={steepFormOpen} onClose={() => setSteepFormOpen(false)} position="bottom" backdrop>
				<SteepForm
					initDegrees={lastSteep?.temperature}
					initVolume={lastSteep?.water}
					onSubmit={handleSteepDone}
				/>
			</Modal>
		</div>
	);
}
