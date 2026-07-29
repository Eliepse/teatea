import clsx from "clsx";
import { useState } from "react";
import { Plus } from "iconoir-react";
import { PrimaryButton } from "~/shared/components/Button";
import { useMutation } from "@tanstack/react-query";
import { makeCreatePostMutation } from "~/social/mutation/createPostMutation";

export function FeedPostInput(props: { className?: string }) {
	const [focused, setFocused] = useState(false);
	const [text, setText] = useState("");
	const active = focused || !!text;
	const canSubmit = active && !!text.trim();

	const mutation = useMutation({
		...makeCreatePostMutation(),
		onSuccess: (post) => {
			setText("");
		},
	});

	function publish() {
		if (!active || mutation.isPending || !text.trim()) {
			return;
		}

		mutation.mutate({ content: text });
	}

	return (
		<div
			className={clsx(
				"duration-200 transition-all relative bg-white/80 rounded-lg mb-6 text-green-900",
				active ? "shadow-lg/5 translate-y-1 -mx-1" : "shadow-xs",
				props.className,
			)}
		>
			<textarea
				className={clsx("w-full px-3 py-4 outline-none resize-none", !active && "pl-9.5")}
				rows={1}
				placeholder="Share your thoughts..."
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
				onChange={(e) => setText(e.target.value)}
				value={text}
			/>

			<div
				className={clsx(
					"duration-200 transition-all overflow-clip",
					active ? "h-12 mt-1" : "h-0 mt-0",
					!active && "invisible",
				)}
			>
				<hr className="mx-4 border-slate-200" />

				<div className="px-4 py-2">
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
