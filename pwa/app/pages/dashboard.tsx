import { Link } from "react-router";
import { useUser } from "~/auth/hooks/useUser";
import { AuthLayout } from "~/layouts/AuthLayout";
import { Paged } from "~/components/shared/paged/Paged";
import { CreateTeaTypeFlow } from "~/components/tea_type/CreateTeaTypeFlow";

export function meta() {
	return [{ title: "Teatea" }];
}

export default function Dashboard() {
	const userQuery = useUser();

	return (
		<AuthLayout className="px-4" activeKey="home">
			<h1 className="mt-4 text-xl">Hi, {userQuery?.data?.username}!</h1>

			<Link to="/drink/new">
				<button className="btn btn-block h-12 mt-6">What are you drinking today?</button>
			</Link>

			<p className="mt-8 text-base-content/60 text-sm">
				Welcome to your personal tea-journal !
				<br />
				This app is currently in a prototyping phase. Don&#39;t hesitate to send me feedbacks for any problem,
				idea or frustrations you have!
				<br />
				<br />
				Élie
			</p>
		</AuthLayout>
	);
}
