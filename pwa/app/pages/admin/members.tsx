import { fetchApi } from "~/utils/api";
import type { Route } from "../../../.react-router/types/app/pages/admin/+types/members";
import type { ApiCollection, Member } from "~t/types";
import { PageLayout } from "~/components/shared/paged/PageLayout";

export async function clientLoader() {
	return await (await fetchApi<ApiCollection<Member>>("/members")).json();
}

export default function MembersPage(props: Route.ComponentProps) {
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
		</PageLayout>
	);
}
