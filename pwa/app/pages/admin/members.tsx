import { fetchApi, postApi } from "~/utils/api";
import type { Route } from "../../../.react-router/types/app/pages/admin/+types/members";
import type { ApiCollection, Member } from "~t/types";
import { PageLayout } from "~/components/shared/paged/PageLayout";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Paged } from "~/components/shared/paged/Paged";
import { useState } from "react";
import { handleUIEvent } from "~/utils/function";
import { useMutation } from "@tanstack/react-query";

export async function clientLoader() {
	return await (await fetchApi<ApiCollection<Member>>("/members")).json();
}

export default function MembersPage(props: Route.ComponentProps) {
	const [formOpen, setFormOpen] = useState(false);

	return (
		<PageLayout title="Members">
			<ul className="">
				{props.loaderData.member.map((member) => (
					<li key={member.id} className="mb-4">
						<article className="bg-base-200 px-3 py-2 rounded">
							<div>
								<span className="font-bold">{member.username}</span>
								<span className="ml-2 text-sm font-mono text-base-content/60">#{member.id}</span>
							</div>
							<div>{member.email}</div>
						</article>
					</li>
				))}
			</ul>

			<button
				className="absolute btn btn-primary bottom-4 right-4 rounded-full h-12 w-12 shadow-md"
				onClick={handleUIEvent(() => setFormOpen(true))}
			>
				<PlusIcon className="size-4" />
			</button>

			<Paged open={formOpen}>
				<CreateMemberForm onDone={() => window.location.reload()} />
			</Paged>
		</PageLayout>
	);
}

function CreateMemberForm(props: { onDone: () => void }) {
	const [form, setForm] = useState<{ email?: string; username?: string }>({});
	const mutation = useMutation({
		mutationFn: async (vars: typeof form) => {
			await postApi("/members", {
				email: vars.email,
				username: vars.username,
			});
		},
		onSuccess: props.onDone,
	});

	function patch(patch: Partial<typeof form>) {
		setForm((st) => ({ ...st, ...patch }));
	}

	return (
		<PageLayout
			title="New member"
			onBack={() => setFormOpen(false)}
			action={
				<button
					className="btn btn-primary ml-auto"
					disabled={!form.email || mutation.isPending}
					onClick={handleUIEvent(() => mutation.mutate(form))}
				>
					{mutation.isPending ? "Processing..." : "Submit"}
				</button>
			}
		>
			{mutation.error && <div className="alert alter-error">{mutation.error.message}</div>}

			<fieldset className="fieldset">
				<legend className="fieldset-legend">Username</legend>
				<input
					type="text"
					className="input w-full"
					onChange={(e) => patch({ username: e.currentTarget.value.trim() })}
				/>
			</fieldset>

			<fieldset className="fieldset">
				<legend className="fieldset-legend">Email</legend>
				<input
					type="email"
					className="input w-full"
					onChange={(e) => patch({ email: e.currentTarget.value.trim() })}
				/>
			</fieldset>
		</PageLayout>
	);
}
