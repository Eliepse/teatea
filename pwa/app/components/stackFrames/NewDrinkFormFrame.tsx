import { PageLayout } from "~/components/shared/paged/PageLayout";
import { useStackNavigator } from "~/utils/navigation/useNavigationStack";
import { handleUIEvent } from "~/utils/function";
import { useNewSipContext } from "~/pages/brewing/add-drink.context";
import { formatDate } from "date-fns";
import { useNavigate } from "react-router";
import type { Tea } from "~t/types";
import { useState } from "react";
import { Check } from "~/components/icons/Check";
import { BrewingTechnic } from "~/components/shared/BrewingTechnic";
import { TeaQuantityInput } from "~/components/shared/inputs/TeaQuantityInput";
import { WaterVolumeInput } from "~/components/shared/inputs/WaterVolumeInput";

export function NewDrinkFormFrame(props: { drankAt?: Date; tea?: Tea }) {
	const navigate = useNavigate();
	const navStack = useStackNavigator();
	const [submitting, setSubmitting] = useState(false);
	const { formData, isSubmitting, ...ctx } = useNewSipContext();
	const [teaWeight, setTeaWeight] = useState(formData.teaQuantity ?? null);
	const [waterVolume, setWaterVolume] = useState(formData.waterVolume ?? null);

	async function submitDrink() {
		const tea = teaWeight ?? 0;
		const water = waterVolume ?? 0;

		await ctx.submit({
			teaQuantity: 0 < tea ? tea : undefined,
			waterVolume: 0 < water ? water : undefined,
		});

		navStack.next({ key: "done" });
	}

	return (
		<PageLayout
			title="Log a drink"
			onBack={() => navigate(-1)}
			bodyClassName="pb-20"
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
				<TeaQuantityInput value={teaWeight} onChange={setTeaWeight} />
			</fieldset>

			<fieldset className="fieldset mb-6">
				<legend className="fieldset-legend">Water volume</legend>
				<WaterVolumeInput value={waterVolume} onChange={setWaterVolume} />
			</fieldset>
		</PageLayout>
	);
}
