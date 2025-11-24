import { TeaSearchEngine } from "~/search/components/TeaSearchEngine";
import { AuthLayout } from "~/layouts/AuthLayout";
import { useSearchParams } from "react-router";

export default function TeaSearchPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const queryText = (searchParams.get("q") ?? "").trim();
	const originPath = (searchParams.get("originPath") ?? "").trim();

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
				onSearch={updateSearchParam}
				defaultFilters={{
					q: 0 !== queryText.length ? queryText : undefined,
					originPath: 0 !== originPath.length ? originPath : undefined,
				}}
				allowCreation
			/>
		</AuthLayout>
	);
}
