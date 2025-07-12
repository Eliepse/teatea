import { useState } from "react";
import { BrewMultiStepForm } from "~/components/brewing/BrewMultiStepForm";
import { AddTeaForm } from "~/components/tea/form/AddTeaForm/AddTeaForm";
import { Link } from "react-router";

export function meta() {
	return [{ title: "Teatea" }];
}

export default function Dashboard() {
	const [brewForm, setBrewForm] = useState(false);
	const [addTeaForm, setAddTeaForm] = useState(false);

	return (
		<div className="px-4">
			<Link to="/drink/new">
				<button className="btn btn-block mt-6">What are you drinking today?</button>
			</Link>

			<Link to="/tea/types/new">
				<button className="btn btn-block mt-6">Add a tea type</button>
			</Link>

			<Link to="/me/teas">
				<button className="btn btn-block mt-6">My collection</button>
			</Link>

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
