import { Link } from "react-router";
import { useUser } from "~/auth/hooks/useUser";
import { AuthLayout } from "~/layouts/AuthLayout";
import { Paged } from "~/components/shared/paged/Paged";
import { CreateTeaTypeFlow } from "~/components/tea_type/CreateTeaTypeFlow";
import { useToken } from "~/auth/hooks/useToken";

export function meta() {
	return [{ title: "Teatea" }];
}

export default function Dashboard() {
	const [token] = useToken();
	const userQuery = useUser();

	return (
		<AuthLayout className="px-4" activeKey="home">
			<h1 className="mt-4 text-xl">Hi, {userQuery?.data?.username}!</h1>

			<Link to="/drink/new" className="btn btn-block h-12 mt-6">
				What are you drinking today?
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

			{token?.roles?.includes("ROLE_ADMIN") && (
				<Link to="/admin" className="btn btn-block h-12 mt-6">
					Admin dashboard
				</Link>
			)}
		</AuthLayout>
	);
}
