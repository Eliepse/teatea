import { type MouseEvent, type PropsWithChildren, useState } from "react";
import { CoffeeCup } from "iconoir-react";
import { CreateSessionModal } from "~/components/teaSession/create/CreateSessionModal";
import type { Iri } from "~t/types";
import { FloatingActionButton } from "~/components/shared/navigation/FloatingActionButton";

export function BrewButton(props: PropsWithChildren<{ tea: Iri; className?: string; text?: string }>) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	function openModal(e: MouseEvent) {
		e.stopPropagation();
		setIsModalOpen(true);
	}

	return (
		<div onClick={openModal} className={props.className}>
			{props.children ?? (
				<FloatingActionButton label={props.text ?? "Brew"} icon={<CoffeeCup className="size-5" />} />
			)}
			<CreateSessionModal tea={props.tea} onClose={() => setIsModalOpen(false)} open={isModalOpen} />
		</div>
	);
}
