import { Fragment, useState } from "react";
import { Globe } from "iconoir-react";
import { TeaSpecButton } from "~/catalog/components/CreateTeaModal/TeaSpecButton";
import { type Iri } from "~t/types";
import { useQuery } from "@tanstack/react-query";
import { OriginSelectModal } from "~/components/origin/OriginSelectModal";
import { makeOriginQueryOpt } from "~/shared/query/originQuery";
import { FormatOrigin } from "~/components/shared/FormatOriginPath";
import type { NewOrigin } from "~/components/origin/OriginSelect";

export function OriginAction(props: { origin?: Iri | NewOrigin; onChange: (origin?: Iri | NewOrigin) => void }) {
	const [isSelecting, setIsSelecting] = useState(false);
	const originQuery = useQuery(
		makeOriginQueryOpt({ "@id": typeof props.origin === "string" ? props.origin : undefined }),
	);
	const newOriginLabel = typeof props.origin === "object" ? <FormatOrigin origin={props.origin} /> : undefined;
	const label = originQuery?.data ? <FormatOrigin origin={originQuery.data} /> : (newOriginLabel ?? "Origin");

	function confirm(value?: Iri | NewOrigin) {
		props.onChange(value);
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
				allowCreate
			/>
		</Fragment>
	);
}
