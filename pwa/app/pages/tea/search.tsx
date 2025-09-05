import { TeaSearchEngine } from "~/components/search/TeaSearchEngine";
import { AuthLayout } from "~/layouts/AuthLayout";
import type { Tea } from "~t/types";
import { useNavigate } from "react-router";

export default function TeaSearchPage() {
	const navigate = useNavigate();

	function openTea(tea: Tea) {
		navigate(`/tea/${tea.id}`);
	}

	return (
		<AuthLayout activeKey="search">
			<TeaSearchEngine onSelect={openTea} />
		</AuthLayout>
	);
}
