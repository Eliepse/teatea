import Arrow from "~/components/icons/arrow";
import { useMultiStepForm } from "../BrewMultiStepForm";
import { Weight } from "~/utils/value-objects/units";
import { teawareTypes } from "~t/teawareType";
import Chevron from "~/components/icons/chevron";
import clsx from "clsx";
import type { ChangeEvent, MouseEvent } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import type { Tea, Teaware } from "~t/types";

async function createBrewingSession(args: { tea: Tea; teaware?: Teaware; quantity?: Weight }) {
	const response = await fetch("/api/brew", {
		method: "POST",
		body: JSON.stringify({
			tea_id: args.tea.id,
			teaware_id: args.teaware?.id,
			quantity: args.quantity?.g,
		}),
	});

	return await response.json();
}

export function Step3() {
	const navigate = useNavigate();
	const form = useMultiStepForm();
	const { tea, teaware, teaQuantity } = form.formValue;
	const mutation = useMutation({
		mutationFn: createBrewingSession,
		onSuccess: (data: { id: number }) => {
			navigate(`/brew/${data.id}`);
		},
	});
	const teawareVolume = teaware?.volume ? `${teaware.volume.ml} ml` : undefined;

	function handleTeaVolumeChange(e: ChangeEvent<HTMLInputElement>) {
		e.stopPropagation();
		const value: number | null = e.currentTarget.value.trim() ? parseInt(e.currentTarget.value.trim()) : null;
		form.updateForm((v) => ({ ...v, teaQuantity: value ? Weight.fromG(Math.abs(value)) : undefined }));
	}

	function handleConfirmBtn(e: MouseEvent) {
		e.stopPropagation();

		if (!tea) {
			return;
		}

		mutation.mutate({ tea, teaware, quantity: teaQuantity });
	}

	return (
		<div className="h-full flex flex-col relative">
			<h2 className="px-6 py-4 border-b border-base-300 text-lg text-base-content">New brewing session</h2>

			<div className="flex-1 overflow-auto p-4 pb-16">
				<SummupButton
					info={[tea?.origin?.name, tea?.cultivar?.name].filter((v) => !!v).join(" · ")}
					onClick={() => form.goTo(1)}
					className="mb-4"
				>
					<span className="font-semibold">{tea?.name ?? tea?.type.name}</span>
				</SummupButton>

				<SummupButton
					info={teaware && [teawareTypes[teaware.type], teawareVolume].filter((v) => !!v).join(" · ")}
					onClick={() => form.goTo(2)}
					className="mb-4"
				>
					{!teaware && <span className="text-base-content/60">No teaware selected</span>}
					{teaware?.name}
				</SummupButton>

				<fieldset className="fieldset">
					<legend className="fieldset-legend">Tea quantity</legend>
					<label className="input w-full">
						<input
							type="text"
							onChange={handleTeaVolumeChange}
							value={teaQuantity?.g ?? ""}
							pattern="[0-1]+"
						/>
						<span className="label">g</span>
					</label>
				</fieldset>

				<fieldset className="fieldset">
					<legend className="fieldset-legend">Water type</legend>
					<select defaultValue="" disabled className="select w-full">
						<option></option>
					</select>
				</fieldset>
			</div>

			<div className="absolute bottom-4 inset-x-4 flex justify-center gap-x-4">
				<button className="btn rounded-full btn-primary" onClick={handleConfirmBtn}>
					Start brewing <Arrow direction="right" className="size-4 ml-1" />
				</button>
			</div>
		</div>
	);
}

function SummupButton(props: React.PropsWithChildren<{ info?: string; className?: string; onClick: () => void }>) {
	function handleClick(e: MouseEvent) {
		e.stopPropagation();
		props.onClick();
	}

	return (
		<div
			className={clsx(
				"flex items-center rounded-md border border-base-300 cursor-pointer py-2 px-4 h-16",
				props.className,
			)}
			onClick={handleClick}
		>
			<div className="flex-1">
				{props.info && <div className="text-xs text-base-content/60">{props.info}</div>}
				<div>{props.children}</div>
			</div>

			<Chevron direction="right" className="flex-none size-4" />
		</div>
	);
}
