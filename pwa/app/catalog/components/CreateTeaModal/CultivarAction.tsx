import { Fragment, useState } from "react";
import { Shop } from "iconoir-react";
import { TeaSpecButton } from "~/catalog/components/CreateTeaModal/TeaSpecButton";
import { type Iri } from "~t/types";
import { useQuery } from "@tanstack/react-query";
import type { NewCultivar } from "~/catalog/components/cultivar/CultivarSelect";
import { makeCultivarQueryOpt } from "~/catalog/query/cultivarQuery";
import { CultivarSelectModal } from "~/catalog/components/cultivar/CultivarSelectModal";

export function CultivarAction(props: {
	cultivar?: Iri | NewCultivar;
	onChange: (cultivar?: Iri | NewCultivar) => void;
	readonly?: boolean;
}) {
	const [isSelecting, setIsSelecting] = useState(false);
	const queryCultivar = useQuery(
		makeCultivarQueryOpt({ "@id": typeof props.cultivar !== "string" ? undefined : props.cultivar }),
	);
	const label = queryCultivar.data?.name ?? (typeof props.cultivar === "object" ? props.cultivar?.name : "Cultivar");

	function confirm(value?: Iri | NewCultivar) {
		props.onChange(value);
		setIsSelecting(false);
	}

	return (
		<Fragment>
			<TeaSpecButton
				icon={<Shop className="size-4" />}
				label={queryCultivar.isLoading ? <span className="inline-block skeleton h-4 w-16" /> : label}
				onClick={() => setIsSelecting(true)}
				filled={!!props.cultivar}
				readonly={props.readonly}
			/>

			<CultivarSelectModal
				open={isSelecting}
				onClose={() => setIsSelecting(false)}
				onSelect={confirm}
				defaultValue={props.cultivar}
				allowToggle
				allowCreate
			/>
		</Fragment>
	);
}
