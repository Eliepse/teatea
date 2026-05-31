import { Fragment, useState } from "react";
import { Leaf } from "iconoir-react";
import clsx from "clsx";
import { TeaSpecButton } from "~/catalog/components/CreateTeaModal/TeaSpecButton";
import { type Iri } from "~t/types";
import { useQuery } from "@tanstack/react-query";
import { makeTeaTypeQueryOpt } from "~/catalog/query/teatypeQuery";
import { TypeSelectModal } from "~/catalog/components/teaType/TypeSelectModal";
import type { NewType } from "~/catalog/components/teaType/TypeSelect";

export function TypeAction(props: {
	type?: Iri | NewType;
	onChange: (type?: Iri | NewType) => void;
	readonly?: boolean;
}) {
	const [isSelecting, setIsSelecting] = useState(false);

	const typeQuery = useQuery(makeTeaTypeQueryOpt({ "@id": typeof props.type !== "string" ? undefined : props.type }));
	const label = typeQuery.data?.name ?? (typeof props.type === "object" ? props.type?.name : "Tea type");

	function confirm(type?: Iri | NewType) {
		props.onChange(type);
		setIsSelecting(false);
	}

	return (
		<Fragment>
			<TeaSpecButton
				icon={<Leaf className={clsx("size-4")} />}
				label={typeQuery.isLoading ? <span className="inline-block skeleton h-4 w-16" /> : label}
				onClick={() => setIsSelecting(true)}
				filled={!!props.type}
				readonly={props.readonly}
			/>

			<TypeSelectModal
				open={isSelecting}
				onClose={() => setIsSelecting(false)}
				onSelect={confirm}
				defaultValue={props.type}
				allowCreate
			/>
		</Fragment>
	);
}
