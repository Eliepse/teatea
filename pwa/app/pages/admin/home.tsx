import { Link, useNavigate } from "react-router";
import { PageLayout } from "~/components/shared/paged/PageLayout";

export default function AdminHomePage() {
	const navigate = useNavigate();

	return (
		<PageLayout title="Admin" onBack={() => navigate("/feed")}>
			<Link to="/admin/members" className="btn btn-block">
				Members
			</Link>
		</PageLayout>
	);
}
