import { useState } from "react";
import { BrewMultiStepForm } from "~/components/brewing/BrewMultiStepForm";

export function meta() {
	return [{ title: "Teatea" }];
}

export default function Home() {
	const [brewForm, setBrewForm] = useState(false);

	return (
		<div className="px-4">
			<button className="btn btn-block mt-6" onClick={() => setBrewForm(true)}>
				Brew
			</button>

			<BrewMultiStepForm open={brewForm} onClose={() => setBrewForm(false)} />
		</div>
	);
}
