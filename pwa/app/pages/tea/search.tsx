import { TeaSearchEngine } from "~/components/search/TeaSearchEngine";
import { AuthLayout } from "~/layouts/AuthLayout";
import type { Tea } from "~t/types";
import { useNavigate, useSearchParams } from "react-router";
import type { Route } from "../../../.react-router/types/app/pages/tea/+types/search";

export default function TeaSearchPage(props: Route.ComponentProps) {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const queryText = (searchParams.get("q") ?? "").trim();
	const originPath = (searchParams.get("originPath") ?? "").trim();

	function openTea(tea: Tea) {
		navigate(`/tea/${tea.id}`);
	}

	function updateSearchParam(text?: string) {
		setSearchParams((params) => {
			if (!text) {
				// Remove "q" param
				return Object.fromEntries(Object.entries(params).filter(([key]) => "q" !== key));
			}

			return { ...params, q: text };
		});
	}

	return (
		<AuthLayout activeKey="search">
			<TeaSearchEngine
				onSelect={openTea}
				onSearch={updateSearchParam}
				defaultFilters={{
					q: 0 !== queryText.length ? queryText : undefined,
					originPath:  0 !== originPath.length ? originPath : undefined,
			}}
			/>
		</AuthLayout>
	);
}
