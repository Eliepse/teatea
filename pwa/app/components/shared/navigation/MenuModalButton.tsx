import { type PropsWithChildren, type ReactNode, useState } from "react";
import { MoreVert } from "iconoir-react";
import { MenuModal } from "~/components/shared/navigation/MenuModal";

export function MenuModalButton(props: PropsWithChildren) {
	const [open, setOpen] = useState(false);
	return (
		<>
			<MenuButton onClick={() => setOpen(true)} />
			<MenuModal onClose={() => setOpen(false)} open={open}>
				{props.children}
			</MenuModal>
		</>
	);
}

export function MenuButton(props: { onClick: () => void; icon?: ReactNode }) {
	return (
		<button className="btn btn-lg bg-white btn-circle shadow-xs" aria-label="Options" onClick={props.onClick}>
			{props.icon ?? <MoreVert className="size-6" />}
		</button>
	);
}
