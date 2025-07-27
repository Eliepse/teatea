import { PageLayout } from "~/components/shared/paged/PageLayout";
import { useStackNavigator } from "~/utils/navigation/useNavigationStack";
import { handleUIEvent } from "~/utils/function";
import { useNewSipContext } from "~/routes/brewing/add-drink.context";
import { formatDate } from "date-fns";
import { useNavigate } from "react-router";
import type { Tea } from "~t/types";
import { type ChangeEvent, useState } from "react";
import { Check } from "~/components/icons/Check";
import { BrewingTechnic } from "~/components/shared/BrewingTechnic";

export function NewDrinkFormFrame(props: { drankAt?: Date; tea?: Tea }) {
	const navigate = useNavigate();
	const navStack = useStackNavigator();
	const [submitting, setSubmitting] = useState(false);
	const { formData, isSubmitting, ...ctx } = useNewSipContext();
	const [teaWeight, setTeaWeight] = useState<number>(formData.teaQuantity ?? 0);

	function handleTeaWeightChange(e: ChangeEvent<HTMLInputElement>) {
		e.stopPropagation();
		const value = Math.max(parseInt(e.currentTarget.value.trim()), 0);
		setTeaWeight(value);
	}

	async function submitDrink() {
		await ctx.submit({ teaQuantity: 0 < teaWeight ? teaWeight : undefined });
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
					{isSubmitting ? (
						"Saving..."
					) : (
						<>
							Save <Check />
						</>
					)}
				</button>
			}
		>
			<fieldset className="fieldset mb-6">
				<legend className="fieldset-legend">When?</legend>
				<button className="input w-full" onClick={handleUIEvent(() => navStack.next({ key: "date" }))}>
					{formData.drankAt ? formatDate(formData.drankAt, "d MMMM yyyy") : "Pick a date"}
				</button>
			</fieldset>

			<fieldset className="fieldset mb-6">
				<legend className="fieldset-legend">Which tea?</legend>
				<button className="input w-full" onClick={handleUIEvent(() => navStack.next({ key: "tea" }))}>
					{formData.tea ? formData.tea["@id"] : "Select a tea..."}
				</button>
			</fieldset>

			<fieldset className="fieldset mb-6">
				<legend className="fieldset-legend">Brewing technic</legend>
				<button className="input w-full" onClick={handleUIEvent(() => navStack.next({ key: "technic" }))}>
					{formData.technic ? <BrewingTechnic value={formData.technic} /> : "Select a technic..."}
				</button>
			</fieldset>

			<fieldset className="fieldset mb-6">
				<legend className="fieldset-legend">Tea quantity</legend>
				<label className="input w-full">
					<input type="number" min="0" value={teaWeight} onChange={handleTeaWeightChange} />
					<span className="label">g</span>
				</label>
			</fieldset>
		</PageLayout>
	);
}
