import type { DrinkForm } from "~/components/drink/CreateDrinkFlow";
import { PageLayout } from "~/components/shared/paged/PageLayout";

export function AskConfirmation(props: { form: DrinkForm; onConfirm: () => void; onBack: () => void }) {
	return <PageLayout title=""></PageLayout>
}
