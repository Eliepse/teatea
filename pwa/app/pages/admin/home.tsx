import { Link } from "react-router";
import { PageLayout } from "~/components/shared/paged/PageLayout";

export default function AdminHomePage() {
	return (
		<PageLayout title="Admin">
			<Link to="/admin/members" className="btn btn-block">
				Members
			</Link>
		</PageLayout>
	);
}
