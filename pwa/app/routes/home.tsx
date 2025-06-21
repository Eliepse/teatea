import { useState } from "react";
import { BrewMultiStepForm } from "~/components/brewing/BrewMultiStepForm";
import { AddTeaForm } from "~/components/tea/form/AddTeaForm/AddTeaForm";

export function meta() {
	return [{ title: "Teatea" }];
}

export default function Home() {
	const [brewForm, setBrewForm] = useState(false);
	const [addTeaForm, setAddTeaForm] = useState(false);

	return (
		<div className="px-4">
			<button className="btn btn-block mt-6" onClick={() => setBrewForm(true)}>
				Brew
			</button>

			<BrewMultiStepForm open={brewForm} onClose={() => setBrewForm(false)} />

			<button className="btn btn-block mt-6" onClick={() => setAddTeaForm(true)}>
				Add tea
			</button>

			<AddTeaForm open={addTeaForm} onClose={() => setAddTeaForm(false)} />
		</div>
	);
}
