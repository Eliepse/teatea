import clsx from "clsx";
import { type ChangeEvent, type FocusEvent, type MouseEvent, useMemo, useRef, useState } from "react";
import { MediaImagePlus, Plus, Xmark } from "iconoir-react";
import { GhostButton, PrimaryButton } from "~/shared/components/Button";
import { useMutation } from "@tanstack/react-query";
import { makeCreatePostMutation } from "~/social/mutation/createPostMutation";

interface IForm {
	text: string;
	files: Array<[string, File]>;
}

const EMPTY_FORM: IForm = { text: "", files: [] };

export function FeedPostInput(props: { className?: string }) {
	const containerRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [focused, setFocused] = useState(false);
	const [form, setForm] = useState<IForm>({ ...EMPTY_FORM });

	const fileInput = useMemo(
		() => <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileUpload} hidden />,
		[],
	);

	const active = focused || !!form.text || !!form.files.length;
	const canSubmit = active && 3 <= form.text.trim()?.length;

	const mutation = useMutation({
		...makeCreatePostMutation(),
		onSuccess: (post) => {
			setForm({ ...EMPTY_FORM });
		},
	});

	function publish() {
		if (!active || mutation.isPending || !form.text.trim()) {
			return;
		}

		mutation.mutate({
			content: form.text,
			images: form.files.length ? form.files.map((entry) => entry[1]) : undefined,
		});
	}

	function handleBlur(e: FocusEvent) {
		if (containerRef.current?.contains(e.target)) {
			return;
		}

		setFocused(false);
	}

	function handleClickFileBtn(e: MouseEvent) {
		e.stopPropagation();
		e.preventDefault();
		fileInputRef.current?.click();
	}

	function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
		setForm((v) => {
			const files = Array.from(e.target.files ?? [])
				.slice(0, 8 - v.files.length)
				.map((file) => [URL.createObjectURL(file), file] satisfies IForm["files"][number]);

			return { ...v, files: [...v.files, ...files].slice(0, 8) };
		});
	}

	return (
		<div
			ref={containerRef}
			className={clsx(
				"duration-200 transition-all relative bg-white/80 rounded-lg mb-6 text-green-900",
				active ? "shadow-lg/5 translate-y-1 -mx-1" : "shadow-xs",
				props.className,
			)}
			onFocus={() => setFocused(true)}
			onBlur={handleBlur}
			tabIndex={-1}
		>
			{fileInput}

			{!!form.files.length && (
				<ul className="flex gap-1 px-3 pt-3">
					{form.files.map(([src, file]) => (
						<li
							key={src}
							className="relative cursor-pointer"
							onClick={() => setForm((v) => ({ ...v, files: v.files.filter((f) => f[1] !== file) }))}
						>
							<span className="bg-white rounded-full absolute -top-1 -right-1 p-0.5 shadow z-1">
								<Xmark className="w-3 h-3 block" />
							</span>
							<img src={src} className="w-10 h-10 rounded object-cover" />
						</li>
					))}
				</ul>
			)}

			<textarea
				className={clsx("w-full px-3 py-4 outline-none resize-none", !active && "pl-9.5")}
				rows={1}
				placeholder="Share your thoughts..."
				onChange={(e) => setForm((v) => ({ ...v, text: e.target.value }))}
				value={form.text}
			/>

			<div
				className={clsx(
					"duration-200 transition-all overflow-clip",
					active ? "h-12 mt-1" : "h-0 mt-0",
					!active && "invisible",
				)}
			>
				<hr className="mx-4 border-slate-200" />

				<div className="px-4 py-2 flex">
					<GhostButton
						icon={<MediaImagePlus />}
						onClick={handleClickFileBtn}
						disabled={8 <= form.files.length}
						small
					/>

					<PrimaryButton
						className="ml-auto"
						loading={mutation.isPending}
						onClick={publish}
						disabled={!canSubmit}
						small
					>
						Send
					</PrimaryButton>
				</div>
			</div>

			{!active && <Plus className="size-5 absolute top-5 left-3" />}
		</div>
	);
}
