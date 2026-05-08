import { TeaSearchEngine } from "~/catalog/components/TeaSearchEngine";
import { WithMainMenu } from "~/layouts/WithMainMenu";
import { useSearchParams } from "react-router";
import type { SearchFilters } from "~/catalog/hooks/useSearchQuery";
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

			// @ts-expect-error
			return new URLSearchParams(patched);
		});
	}

	const year = safeEmpty((searchParams.get("year") ?? "").trim());
	const origin = safeEmpty((searchParams.get("origin") ?? "").trim());
	const rootOrigin = safeEmpty((searchParams.get("rootOrigin") ?? "").trim());
	const business = safeEmpty((searchParams.get("business") ?? "").trim());

	return (
		<WithMainMenu activeKey="search">
			<TeaSearchEngine
				defaultFilters={{
					q: safeEmpty((searchParams.get("q") ?? "").trim()),
					origin: origin ?? rootOrigin,
					rootOrigin: rootOrigin,
					family: safeEmpty((searchParams.get("family") ?? "").trim() as TeaFamily | undefined),
					type: safeEmpty((searchParams.get("type") ?? "").trim()),
					year: year ? parseInt(year) : undefined,
					business: business ? parseInt(business) : undefined,
				}}
				onFiltersChange={handleFiltersChanged}
				allowCreation
			/>
		</WithMainMenu>
	);
}
