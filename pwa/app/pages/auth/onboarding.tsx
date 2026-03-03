import { TokenUtils, useToken } from "~/auth/hooks/useToken";
import { redirect, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { type ChangeEvent, type PropsWithChildren, useState } from "react";
import { ArrowDownCircleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { handleUIEvent } from "~/utils/function";
import { useUser } from "~/auth/hooks/useUser";
import { StackFrame, useNavigationStack } from "~/utils/navigation/useNavigationStack";
import { refreshToken } from "~/auth/requests";
import clsx from "clsx";
import { patchApi } from "~/utils/api";
import { usePWAInstall } from "~/utils/browser/usePWAInstall";
import { usePostHog } from "@posthog/react";
import { RefreshDouble } from "iconoir-react";

export async function clientLoader() {
	const token = TokenUtils.get();

	if (null === token) {
		return redirect("/");
	}

	if (token.roles?.includes("ROLE_USER")) {
		throw redirect("/welcome");
	}
}

export default function OnboardingPage() {
	const user = useUser();
	const [token] = useToken();
	const navigate = useNavigate();
	const posthog = usePostHog();
	const { installable, installed } = usePWAInstall();
	const { NavigationStack, ...stack } = useNavigationStack({ defaultFrame: "welcome" });

	const mutation = useMutation({
		mutationFn: async (username: string) => {
			if (!user.data) {
				console.warn("User not defined");
				return;
			}

			posthog.capture("onboarding_submitted_username", { username });
			await patchApi(`/members/${user.data.id}/onboarding`, { username });
			stack.next("cta:session");
		},
	});

	async function start(redirectTo: string) {
		await refreshToken();
		await user.refetch();
		navigate(redirectTo);
	}

	return (
		<NavigationStack>
			<StackFrame frameKey="welcome">
				<div className="flex flex-col h-dvh p-4 text-green-950">
					<div className="flex-1 flex flex-col justify-center">
						<h2 className="text-3xl font-header font-extrabold text-green-600">Welcome to Teatea!</h2>
						<p className="max-w-xs mt-8 text-lg">
							Teatea is a place dedicated to Tea and the social interaction around it.
						</p>

						<p className="max-w-xs mt-4 text-lg">
							Setup your account and start sharing your tea journey with other tea friends!
						</p>
					</div>

					<div className="flex-none flex items-center">
						<ProgressDots steps={installable ? 4 : 3} active={1} className="mr-auto" />
						<NextButton
							onClick={() => {
								posthog.capture("onboarding_confirmed_step", { step: "intro" });
								stack.next(installable ? "ask:pwa" : "ask:username");
							}}
						>
							Next <ArrowRightIcon direction="right" className="size-4 ml-1" />
						</NextButton>
					</div>
				</div>
			</StackFrame>

			<StackFrame frameKey="ask:pwa">
				<ProposePWA
					onNext={() => {
						posthog.capture("onboarding_confirmed_step", { step: "pwa" });
						stack.next("ask:username");
					}}
				/>
			</StackFrame>

			<StackFrame frameKey="ask:username">
				<AskUsername
					submitting={mutation.isPending}
					onSubmit={(username) => mutation.mutateAsync(username)}
					steps={installable ? 4 : 3}
					step={installable ? 3 : 2}
				/>
			</StackFrame>

			<StackFrame frameKey="cta:session">
				<div className="flex flex-col h-dvh p-4">
					<div className="flex-1 flex flex-col justify-center items-start">
						<h2 className="text-3xl font-header font-extrabold text-green-600">Ready?</h2>
						<p className="max-w-xs mt-6 text-lg">
							Start your journey by adding your first tea session in your journal.
						</p>

						<button
							className="mt-4 btn btn-lg bg-green-700 text-white rounded-xl"
							onClick={() => {
								posthog.capture("onboarding_confirmed_step", { step: "session", target: "search" });
								start("/tea/search");
							}}
						>
							Add my first tea session <ArrowRightIcon className="size-4" />
						</button>
					</div>

					<div className="flex-none flex items-center">
						<ProgressDots steps={installable ? 4 : 3} active={installable ? 4 : 3} className="mr-auto" />
						<button
							className="ml-auto btn btn-lg bg-green-100 text-green-600 rounded-xl"
							onClick={() => {
								posthog.capture("onboarding_confirmed_step", { step: "session", target: "home" });
								start("/welcome");
							}}
						>
							Skip <ArrowRightIcon className="size-4" />
						</button>
					</div>
				</div>
			</StackFrame>
		</NavigationStack>
	);
}

function AskUsername(props: {
	submitting: boolean;
	onSubmit: (username: string) => Promise<void>;
	steps: number;
	step: number;
}) {
	const [username, setUsername] = useState<string>();
	const [error, setError] = useState<string | undefined>();

	function handleUsernameChange(e: ChangeEvent<HTMLInputElement>) {
		const value = e.target.value
			.trim()
			.replaceAll(/\s+/gi, "_")
			.replaceAll(/_+/gi, "_")
			.replaceAll(/[^\p{L}_]/giu, "");

		setUsername(value.length ? value.substring(0, 16) : undefined);
	}

	function submitUsername() {
		if (!username) {
			return;
		}

		props.onSubmit(username).catch((e) => {
			if ("Unavailable username" === e.message) {
				setError("This username is not available");
				return;
			}

			setError("Failed to save the username, try again later");
		});
	}

	return (
		<div className="flex flex-col h-dvh p-4">
			<div className="flex-1 flex flex-col justify-center">
				<h2 className="text-3xl font-header font-extrabold text-green-600">How should people call you here?</h2>
				<fieldset className="fieldset w-full mt-8">
					<label className="label">Username</label>
					<input
						type="email"
						name="email"
						autoComplete="email"
						className={clsx("input w-full", error && "input-error")}
						value={username ?? ""}
						minLength={2}
						maxLength={16}
						onChange={handleUsernameChange}
					/>
					{error && <p className="label text-error">{error}</p>}
				</fieldset>
			</div>

			<div className="flex-none flex items-center">
				<ProgressDots steps={props.steps} active={props.step} className="mr-auto" />
				<NextButton disabled={(username?.length ?? 0) < 2 || props.submitting} onClick={submitUsername}>
					{props.submitting ? "Submitting" : "Submit"}

					{props.submitting ? (
						<RefreshDouble className="size-4 animate-spin" />
					) : (
						<ArrowRightIcon direction="right" className="size-4 ml-1" />
					)}
				</NextButton>
			</div>
		</div>
	);
}

function ProposePWA(props: { onNext: () => void }) {
	const pwaInstall = usePWAInstall();

	async function install() {
		if (await pwaInstall.prompt()) {
			props.onNext();
		}
	}

	return (
		<div className="flex flex-col h-dvh p-4">
			<div className="flex-1 flex flex-col justify-center">
				<h2 className="text-3xl font-header font-extrabold text-green-600">Quick access</h2>
				<p className="max-w-xs mt-6 text-lg">
					Add your journal to your phone as an app to access it easily anytime!
				</p>

				<button className="btn btn-primary h-12 mt-8" onClick={handleUIEvent(install)}>
					Install the web app
					<ArrowDownCircleIcon className="ml-2 size-4" />
				</button>
			</div>

			<div className="flex-none flex items-center">
				<ProgressDots steps={4} active={2} className="mr-auto" />
				<button className="btn ml-auto" onClick={handleUIEvent(props.onNext)}>
					Skip <ArrowRightIcon className="size-4" />
				</button>
			</div>
		</div>
	);
}

function ProgressDots(props: { steps: number; active: number; className?: string }) {
	const dots = [];

	for (let i = 1; i <= props.steps; i++) {
		const cls = props.active >= i ? "bg-green-600" : "bg-green-100";
		dots.push(<span key={i} className={clsx("inline-block rounded-full h-4 w-4 mr-2", cls)}></span>);
	}

	return <div className={props.className}>{dots}</div>;
}

function NextButton(props: PropsWithChildren<{ onClick: () => void; disabled?: boolean }>) {
	return (
		<button
			className="ml-auto btn btn-lg bg-green-700 text-white rounded-xl disabled:bg-teal-100 disabled:text-teal-500"
			onClick={props.onClick}
			disabled={props.disabled}
		>
			{props.children}
		</button>
	);
}
