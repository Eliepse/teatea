import { type PropsWithChildren, useState } from "react";
import { MoreVert } from "iconoir-react";
import { MenuModal } from "~/components/shared/navigation/MenuModal";

export function MenuButton(props: PropsWithChildren) {
	const [open, setOpen] = useState(false);
	return (
		<>
			<button
				className="btn btn-lg bg-white btn-circle shadow-xs"
				aria-label="Options"
				onClick={() => setOpen(true)}
			>
				<MoreVert className="size-6" />
			</button>
			<MenuModal onClose={() => setOpen(false)} open={open}>
				{props.children}
			</MenuModal>
		</>
	);
}
