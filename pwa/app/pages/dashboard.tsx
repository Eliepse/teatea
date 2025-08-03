import { useState } from "react";
import { Link } from "react-router";
import { useUser } from "~/auth/hooks/useUser";
import { AuthLayout } from "~/layouts/AuthLayout";
import { Paged } from "~/components/shared/paged/Paged";
import { CreateTeaTypeFlow } from "~/components/tea_type/create/CreateTeaTypeFlow";

export function meta() {
	return [{ title: "Teatea" }];
}

export default function Dashboard() {
	const [brewForm, setBrewForm] = useState(false);
	const [teaTypeFlow, setTeaTypeFlow] = useState(false);
	const [typeFlow, setTypeFlow] = useState(false);
	const userQuery = useUser();

	return (
		<AuthLayout className="px-4" activeKey="home">
			<h1 className="mt-4 text-xl">Hi, {userQuery?.data?.username}!</h1>

			<Link to="/drink/new">
				<button className="btn btn-block mt-6">What are you drinking today?</button>
			</Link>

			<Link to="/tea/new">
				<button className="btn btn-block mt-6">Add a new tea</button>
			</Link>

			<button className="btn btn-block mt-6" onClick={() => setTeaTypeFlow(true)}>
				Add type of tea
			</button>

			<Paged open={teaTypeFlow}>
				<CreateTeaTypeFlow onClose={() => setTeaTypeFlow(false)} />
			</Paged>
		</AuthLayout>
	);
}
