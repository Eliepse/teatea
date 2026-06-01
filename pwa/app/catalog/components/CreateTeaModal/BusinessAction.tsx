import { Fragment, useState } from "react";
import { Shop } from "iconoir-react";
import { TeaSpecButton } from "~/catalog/components/CreateTeaModal/TeaSpecButton";
import { type Iri } from "~t/types";
import { useQuery } from "@tanstack/react-query";
import { makeBusinessQueryOpt } from "~/utils/query/businessQuery";
import { type NewBusiness } from "~/catalog/components/business/BusinessSelect";
import { BusinessSelectModal } from "~/catalog/components/business/BusinessSelectModal";

export function BusinessAction(props: {
	business?: Iri | NewBusiness;
	onChange: (business?: Iri | NewBusiness) => void;
	readonly?: boolean;
}) {
	const [isSelecting, setIsSelecting] = useState(false);
	const queryBusiness = useQuery(
		makeBusinessQueryOpt({ "@id": typeof props.business !== "string" ? undefined : props.business }),
	);
	const label = queryBusiness.data?.name ?? (typeof props.business === "object" ? props.business?.name : "Business");

	function confirm(value?: Iri | NewBusiness) {
		props.onChange(value);
		setIsSelecting(false);
	}

	return (
		<Fragment>
			<TeaSpecButton
				icon={<Shop className="size-4" />}
				label={queryBusiness.isLoading ? <span className="inline-block skeleton h-4 w-16" /> : label}
				onClick={() => setIsSelecting(true)}
				filled={!!props.business}
				readonly={props.readonly}
			/>

			<BusinessSelectModal
				open={isSelecting}
				onClose={() => setIsSelecting(false)}
				onSelect={confirm}
				defaultValue={props.business}
				allowToggle
				allowCreate
			/>
		</Fragment>
	);
}
