import { type MouseEvent, type PropsWithChildren, useState } from "react";
import { CoffeeCup } from "iconoir-react";
import clsx from "clsx";
import { CreateSessionModal } from "~/components/teaSession/create/CreateSessionModal";
import type { Iri } from "~t/types";

export function BrewButton(props: PropsWithChildren<{ tea: Iri; className?: string }>) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	function openModal(e: MouseEvent) {
		e.stopPropagation();
		setIsModalOpen(true);
	}

	return (
		<div onClick={openModal} className={props.className}>
			{props.children ?? <BrewButtonInner />}
			<CreateSessionModal tea={props.tea} onClose={() => setIsModalOpen(false)} open={isModalOpen} />
		</div>
	);
}

export function BrewButtonInner(props: { className?: string }) {
	return (
		<button className={clsx("btn btn-lg btn-primary rounded-full", props.className)}>
			Brew it
			<CoffeeCup className="ml-1 size-5" />
		</button>
	);
}
