import { lazy, Suspense, useState } from "react";
import { Paged } from "~/components/shared/paged/Paged";
import { handleUIEvent } from "~/utils/function";
import clsx from "clsx";

const TeaCreateFlow = lazy(async () => {
	const module = await import("~/components/tea/CreateTeaFlow");
	return { default: module.CreateTeaFlow };
});

export function CreateTeaButton(props: { className?: string }) {
	const [open, setOpen] = useState(false);

	return (
		<button className={clsx("btn", props.className)} onClick={handleUIEvent(() => setOpen(true))}>
			{!open && "Add a new tea"}

			{open && (
				<Suspense fallback={"Loading..."}>
					<Paged open={open}>
						<TeaCreateFlow onClose={() => setOpen(false)} />
					</Paged>
				</Suspense>
			)}
		</button>
	);
}
