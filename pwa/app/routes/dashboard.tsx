import { useState } from "react";
import { AddTeaForm } from "~/components/tea/form/AddTeaForm/AddTeaForm";
import { Link } from "react-router";
import { ActivityGraph } from "~/components/activity/ActivityGraph";
import { useUser } from "~/auth/hooks/useUser";
import Arrow from "~/components/icons/arrow";
import { AuthLayout } from "~/layouts/AuthLayout";

export function meta() {
	return [{ title: "Teatea" }];
}

export default function Dashboard() {
	const [brewForm, setBrewForm] = useState(false);
	const [addTeaForm, setAddTeaForm] = useState(false);
	const [typeFlow, setTypeFlow] = useState(false);
	const userQuery = useUser();

	return (
		<AuthLayout className="px-4" activeKey="home">
			<h1 className="mt-4 text-xl">Hi, {userQuery?.data?.username}!</h1>

			<Link to="/drink/new">
				<button className="btn btn-block mt-6">What are you drinking today?</button>
			</Link>

			<button className="btn btn-block mt-6" onClick={() => setAddTeaForm(true)}>
				Add tea
			</button>

			<AddTeaForm open={addTeaForm} onClose={() => setAddTeaForm(false)} />
		</AuthLayout>
	);
}
