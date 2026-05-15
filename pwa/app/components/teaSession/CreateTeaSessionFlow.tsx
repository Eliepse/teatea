import { useState } from "react";
import type { CollectionTea, Tea } from "~t/types";
import { StackFrame, useNavigationStack } from "~/utils/navigation/useNavigationStack";
import { ParametersInput } from "~/components/teaSession/create/ParametersInput";
import { FrameDatePicker } from "~/components/shared/frame/FrameDatePicker";
import { useMutation } from "@tanstack/react-query";
import { postApi } from "~/utils/api";
import type { TeaSessionRaw } from "~/utils/api/normalization/teaSession";
import { formatISO } from "date-fns";
import { useNavigate } from "react-router";
import { useAlert } from "~/components/shared/modal/AlertManager";
import { handleUIEvent } from "~/utils/function";
import Arrow from "~/components/icons/arrow";
import clsx from "clsx";
import { CoffeeCup, RefreshDouble } from "iconoir-react";
import { usePostHog } from "@posthog/react";

export type SessionForm = {
	teaQuantity?: number;
	waterMl?: number;
	drankAt: Date;
};

const FRAME_INFO_MAPPER = {
	"parameters:input": { step: 1, title: "How will you brew it?" },
	"date:select": { step: 2, title: "Is it a past session?" },
	"place:select": { step: 3, title: "Is it in a special place?" },
} as const;

export function CreateTeaSessionFlow(props: {
	tea: Pick<Tea | CollectionTea, "@id" | "id" | "@type">;
	onCancel: () => void;
}) {
	const navigate = useNavigate();
	const alert = useAlert();
	const posthog = usePostHog();
	const [form, setForm] = useState<SessionForm>({ drankAt: new Date() });
	const { NavigationStack, ...stackNavigator } = useNavigationStack({ defaultFrame: "parameters:input" });
	const currentFrameKey = stackNavigator.stack.slice(-1)[0] as keyof typeof FRAME_INFO_MAPPER;

	function goBack() {
		if (1 === stackNavigator.stack.length) {
			posthog.capture("session_flow_closed");
			props.onCancel();
			return;
		}

		stackNavigator.back();
		posthog.capture("session_flow_back");
		return;
	}

	const mutation = useMutation({
		mutationFn: async (data: SessionForm) => {
			const iri = props.tea["@id"];
			console.debug(props.tea);
			const payload = {
				...data,
				drankAt: formatISO(data.drankAt),
				tea: "Tea" === props.tea["@type"] ? iri : undefined,
				collectionTea: "CollectionTea" === props.tea["@type"] ? iri : undefined,
			};

			return await (await postApi<TeaSessionRaw>("/tea_sessions", payload)).json();
		},
		onError: (e) => {
			alert({ title: "Error while saving your experience", body: e.message });
		},
		onSuccess: (data) => {
			setTimeout(() => navigate(`/sessions/${data.id}?edit=1`), 500);
		},
	});

	if (mutation.isPending || mutation.isSuccess) {
		return (
			<div className="flex items-center justify-center h-full text-lg text-green-700 py-16">
				<div>
					<CoffeeCup className="mx-auto mb-4 size-14 animate-bounce text-green-600" />
					<span className="ml-2 font-medium">Starting the session...</span>
				</div>
			</div>
		);
	}

	const header = (
		<HeaderWithSteps
			key="header"
			title={FRAME_INFO_MAPPER[currentFrameKey].title}
			steps={Object.values(FRAME_INFO_MAPPER).length}
			current={FRAME_INFO_MAPPER[currentFrameKey].step}
		/>
	);

	return (
		<NavigationStack>
			<StackFrame frameKey="parameters:input">
				<ParametersInput
					header={header}
					className="h-full"
					onBack={goBack}
					defaultTea={form.teaQuantity}
					defaultWater={form.waterMl}
					onConfirm={(tea, water) => {
						posthog.capture("session_flow_next", { step: "parameters" });
						setForm((st) => ({ ...st, teaQuantity: tea, waterMl: water }));
						stackNavigator.next("date:select");
					}}
				/>
			</StackFrame>
			<StackFrame frameKey="date:select">
				<FrameDatePicker
					header={header}
					className="h-full"
					onBack={goBack}
					defaultValue={form.drankAt}
					onConfirm={(date) => {
						posthog.capture("session_flow_next", { step: "date" });
						setForm({ ...form, drankAt: date });
						stackNavigator.next("place:select");
						mutation.mutate({ ...form, drankAt: date });
					}}
				/>
			</StackFrame>
		</NavigationStack>
	);
}

function HeaderWithSteps(props: { title?: string; onBack?: () => void; steps: number; current: number }) {
	const progression = ((props.current / props.steps) * 100).toFixed(0);
	return (
		<div className="text-green-900 flex-none">
			{!!props.title && (
				<h1 className="py-4 font-header font-medium text-center text-xl border-b border-green-100">
					{props.title}
				</h1>
			)}

			<div className="relative flex justify-around -translate-y-1">
				<div
					className="absolute transition-all left-0 top-1 h-0.5 bg-green-700"
					style={{ width: `${progression}%` }}
				/>
			</div>
		</div>
	);
}

export function FrameActions(props: {
	onBack?: () => void;
	onNext: () => void | Promise<void>;
	disableNext?: boolean;
	className?: string;
	nextLabel?: string;
}) {
	const [pending, setPending] = useState(false);

	async function handleConfirm() {
		try {
			setPending(true);
			await props.onNext();
		} finally {
			setPending(false);
		}
	}

	return (
		<div className={clsx("flex", props.className)}>
			{props.onBack && (
				<button className="btn btn-lg bg-green-100 rounded-xl" onClick={handleUIEvent(props.onBack)}>
					<Arrow direction="left" className="size-4 mr-1" />
					Back
				</button>
			)}

			<button
				className="ml-auto btn btn-lg bg-green-700 text-white rounded-xl disabled:bg-teal-100 disabled:text-teal-500"
				onClick={handleUIEvent(handleConfirm)}
				disabled={props.disableNext || pending}
			>
				{props.nextLabel ?? "Next"}
				{pending ? (
					<RefreshDouble className="size-4 animate-spin" />
				) : (
					<Arrow direction="right" className="size-4 ml-1" />
				)}
			</button>
		</div>
	);
}
