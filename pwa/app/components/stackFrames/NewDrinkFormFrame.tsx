import { PageLayout } from "~/components/shared/paged/PageLayout";
import { useStackNavigator } from "~/utils/navigation/useNavigationStack";
import { handleUIEvent } from "~/utils/function";
import { useNewSipContext } from "~/routes/brewing/add-drink.context";
import { formatDate } from "date-fns";
import { useNavigate } from "react-router";
import type { Tea } from "~t/types";
import Arrow from "~/components/icons/arrow";
import { useState } from "react";
import { Check } from "~/components/icons/Check";

export function NewDrinkFormFrame(props: { drankAt?: Date; tea?: Tea }) {
	const navigate = useNavigate();
	const navStack = useStackNavigator();
	const [submitting, setSubmitting] = useState(false);
	const { formData, isSubmitting, ...ctx } = useNewSipContext();

	async function submitDrink() {
		await ctx.submit();
		navStack.next({ key: "done" });
	}

	return (
		<PageLayout
			title="Log a drink"
			onBack={() => navigate(-1)}
			action={
				<button
					className="flex mx-auto btn btn-primary"
					disabled={isSubmitting || !formData.tea || !formData.drankAt}
					onClick={handleUIEvent(submitDrink)}
				>
					{isSubmitting ? "Saving..." : <>Save <Check /></>}
				</button>
			}
		>
			<fieldset className="fieldset mb-6">
				<legend className="fieldset-legend">When?</legend>
				<button className="input w-full" onClick={handleUIEvent(() => navStack.next({ key: "date" }))}>
					{formData.drankAt ? formatDate(formData.drankAt, "d MMMM yyyy") : "Pick a date"}
				</button>
			</fieldset>

			<fieldset className="fieldset">
				<legend className="fieldset-legend">Which tea?</legend>
				<button className="input w-full" onClick={handleUIEvent(() => navStack.next({ key: "tea" }))}>
					{formData.tea ? formData.tea["@id"] : "Select a tea..."}
				</button>
			</fieldset>
		</PageLayout>
	);
}
