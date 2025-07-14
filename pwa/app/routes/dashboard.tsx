import { useState } from "react";
import { BrewMultiStepForm } from "~/components/brewing/BrewMultiStepForm";
import { AddTeaForm } from "~/components/tea/form/AddTeaForm/AddTeaForm";
import { Link } from "react-router";
import { ActivityGraph } from "~/components/activity/ActivityGraph";
import { useUser } from "~/auth/hooks/useUser";

export function meta() {
	return [{ title: "Teatea" }];
}

export default function Dashboard() {
	const [brewForm, setBrewForm] = useState(false);
	const [addTeaForm, setAddTeaForm] = useState(false);
	const userQuery = useUser();

	return (
		<div className="px-4">
			<h1 className="mt-4 text-xl">Hi, {userQuery?.data?.username}!</h1>

			<p className="text-sm text-content/60 mt-6">Your activity this year</p>
			<ActivityGraph className="mt-2 mb-6" />

			<Link to="/drink/new">
				<button className="btn btn-block mt-6">What are you drinking today?</button>
			</Link>

			<Link to="/tea/types/new">
				<button className="btn btn-block mt-6">Add a tea type</button>
			</Link>

			<button className="btn btn-block mt-6" onClick={() => setAddTeaForm(true)}>
				Add tea
			</button>

			<AddTeaForm open={addTeaForm} onClose={() => setAddTeaForm(false)} />
		</div>
	);
}
