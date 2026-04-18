import { TeaSearchEngine } from "~/search/components/TeaSearchEngine";
import { AuthLayout } from "~/layouts/AuthLayout";
import { useSearchParams } from "react-router";
import type { SearchFilters } from "~/search/hooks/useSearchQuery";
import { safeEmpty } from "~/utils/general";
import type { TeaFamily } from "~t/types";

export async function clientLoader() {}

export default function TeaSearchPage() {
	const [searchParams, setSearchParams] = useSearchParams();

	function handleFiltersChanged(filters?: SearchFilters): void {
		setSearchParams((params) => {
			const original = Object.fromEntries(params.entries());

			const patched = Object.fromEntries(
				Object.entries({ ...original, ...filters }).filter(([_, v]) =>
					typeof v === "string" ? !!v.trim() : !!v,
				),
			);

			return new URLSearchParams(patched);
		});
	}

	const year = safeEmpty((searchParams.get("year") ?? "").trim());

	return (
		<AuthLayout activeKey="search">
			<TeaSearchEngine
				defaultFilters={{
					q: safeEmpty((searchParams.get("q") ?? "").trim()),
					origin: safeEmpty((searchParams.get("origin") ?? "").trim()),
					family: safeEmpty((searchParams.get("family") ?? "").trim() as TeaFamily | undefined),
					type: safeEmpty((searchParams.get("type") ?? "").trim()),
					year: year ? parseInt(year) : undefined,
				}}
				onFiltersChange={handleFiltersChanged}
				allowCreation
			/>
		</AuthLayout>
	);
}
