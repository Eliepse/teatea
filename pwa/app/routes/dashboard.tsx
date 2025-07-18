import { useState } from "react";
import { AddTeaForm } from "~/components/tea/form/AddTeaForm/AddTeaForm";
import { Link } from "react-router";
import { ActivityGraph } from "~/components/activity/ActivityGraph";
import { useUser } from "~/auth/hooks/useUser";
import { AddTeaTypeFlow } from "~/components/tea/AddTeaTypeFlow";
import { Paged } from "~/components/shared/paged/Paged";
import { handleUIEvent } from "~/utils/function";

export function meta() {
	return [{ title: "Teatea" }];
}

export default function Dashboard() {
	const [brewForm, setBrewForm] = useState(false);
	const [addTeaForm, setAddTeaForm] = useState(false);
	const [typeFlow, setTypeFlow] = useState(false);
	const userQuery = useUser();

	return (
		<div className="px-4">
			<h1 className="mt-4 text-xl">Hi, {userQuery?.data?.username}!</h1>

			<p className="text-sm text-content/60 mt-6">Your activity this year</p>
			<ActivityGraph className="mt-2 mb-6" />

			<Link to="/drink/new">
				<button className="btn btn-block mt-6">What are you drinking today?</button>
			</Link>

			<button className="btn btn-block mt-6" onClick={handleUIEvent(() => setTypeFlow(true))}>
				Add a tea type
			</button>

			<button className="btn btn-block mt-6" onClick={() => setAddTeaForm(true)}>
				Add tea
			</button>

			<Paged open={typeFlow}>
				<AddTeaTypeFlow />
			</Paged>
			<AddTeaForm open={addTeaForm} onClose={() => setAddTeaForm(false)} />
		</div>
	);
}
