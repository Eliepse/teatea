import { Fragment, useState } from "react";
import { Globe, Xmark } from "iconoir-react";
import clsx from "clsx";
import { TeaSpecButton } from "~/catalog/components/CreateTeaModal/TeaSpecButton";
import { type Iri } from "~t/types";
import { useQuery } from "@tanstack/react-query";
import { OriginSelectModal } from "~/components/origin/OriginSelectModal";
import { makeOriginQueryOpt } from "~/shared/query/originQuery";

export function OriginAction(props: { origin?: Iri; onChange: (origin?: Iri) => void }) {
	const [isSelecting, setIsSelecting] = useState(false);
	const originQuery = useQuery(makeOriginQueryOpt({ "@id": props.origin }));
	const label = originQuery?.data?.name ?? "Origin";

	function confirm(iri?: Iri) {
		props.onChange(iri);
		setIsSelecting(false);
	}

	return (
		<Fragment>
			<TeaSpecButton
				icon={<Globe className="size-4" />}
				label={originQuery.isLoading ? <span className="inline-block skeleton h-4 w-16" /> : label}
				onClick={() => setIsSelecting(true)}
				filled={!!props.origin}
			/>

			<OriginSelectModal
				open={isSelecting}
				onClose={() => setIsSelecting(false)}
				onSelect={confirm}
				defaultValue={props.origin}
				allowToggle
			/>
		</Fragment>
	);
}
