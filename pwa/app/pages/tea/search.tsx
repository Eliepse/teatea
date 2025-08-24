import { TeaSearchEngine } from "~/components/search/TeaSearchEngine";
import { AuthLayout } from "~/layouts/AuthLayout";

export default function TeaSearchPage() {
	return (
		<AuthLayout activeKey="search">
			<TeaSearchEngine onSelect={console.debug} />
		</AuthLayout>
	);
}
