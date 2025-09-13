import type { SessionForm } from "~/components/teaSession/CreateTeaSessionFlow";
import { PageLayout } from "~/components/shared/paged/PageLayout";

export function AskConfirmation(props: { form: SessionForm; onConfirm: () => void; onBack: () => void }) {
	return <PageLayout title=""></PageLayout>
}
