import { TokenUtils } from "~/auth/hooks/useToken";
import { redirect, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { type ChangeEvent, useState } from "react";
import { ArrowDownCircleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { handleUIEvent } from "~/utils/function";
import { useUser } from "~/auth/hooks/useUser";
import { StackFrame, useNavigationStack } from "~/utils/navigation/useNavigationStack";
import { refreshToken } from "~/auth/requests";
import clsx from "clsx";
import { patchApi } from "~/utils/api";
import { usePWAInstall } from "~/utils/browser/usePWAInstall";

export async function clientLoader() {
	const token = TokenUtils.get();

	if (null === token) {
		return redirect("/login");
	}

	if (token.roles?.includes("ROLE_USER")) {
		throw redirect("/welcome");
	}
}

export default function OnboardingPage() {
	const user = useUser();
	const navigate = useNavigate();
	const { installable, installed } = usePWAInstall();
	const { NavigationStack, ...stack } = useNavigationStack({ defaultFrame: "welcome" });

	const mutation = useMutation({
		mutationFn: async (username: string) => {
			if (!user.data) {
				console.warn("User not defined");
				return;
			}

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
				<div className="flex flex-col h-dvh p-4">
					<div className="flex-1 flex flex-col justify-center">
						<h2 className="text-3xl text-primary">Welcome to Teatea!</h2>
						<p className="max-w-xs mt-8 text-lg">
							Teatea is a place dedicated to Tea and the social interaction around it.
						</p>

						<p className="max-w-xs mt-4 text-lg">
							Setup your account and start sharing your tea journey with other tea friends!
						</p>
					</div>

					<div className="flex-none flex items-center">
						<ProgressDots steps={installable ? 4 : 3} active={1} className="mr-auto" />
						<button
							className="btn btn-primary"
							onClick={handleUIEvent(() => stack.next(installable ? "ask:pwa" : "ask:username"))}
						>
							Next <ArrowRightIcon className="size-4" />
						</button>
					</div>
				</div>
			</StackFrame>

			<StackFrame frameKey="ask:pwa">
				<ProposePWA onNext={() => stack.next("ask:username")} />
			</StackFrame>

			<StackFrame frameKey="ask:username">
				<AskUsername
					submitting={mutation.isPending}
					onSubmit={(username) => mutation.mutate(username)}
					steps={installable ? 4 : 3}
					step={installable ? 3 : 2}
				/>
			</StackFrame>

			<StackFrame frameKey="cta:session">
				<div className="flex flex-col h-dvh p-4">
					<div className="flex-1 flex flex-col justify-center items-start">
						<h2 className="text-xl text-primary">Ready?</h2>
						<p className="max-w-xs mt-6 text-lg">
							Start your journey by adding your first tea session in your journal.
						</p>

						<button className="btn btn-primary mt-6" onClick={handleUIEvent(() => start("/session/new"))}>
							Add my first tea session <ArrowRightIcon className="size-4" />
						</button>
					</div>

					<div className="flex-none flex items-center">
						<ProgressDots steps={installable ? 4 : 3} active={installable ? 4 : 3} className="mr-auto" />
						<button className="btn" onClick={handleUIEvent(() => start("/welcome"))}>
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
	onSubmit: (username: string) => void;
	steps: number;
	step: number;
}) {
	const [username, setUsername] = useState<string>();

	function handleUsernameChange(e: ChangeEvent<HTMLInputElement>) {
		const value = e.target.value
			.trim()
			.replaceAll(/\s+/gi, "_")
			.replaceAll(/_+/gi, "_")
			.replaceAll(/[^\p{L}_]/giu, "");

		setUsername(value.length ? value.substring(0, 16) : undefined);
	}

	return (
		<div className="flex flex-col h-dvh p-4">
			<div className="flex-1 flex flex-col justify-center">
				<h2 className="text-xl text-primary">How should people call you here?</h2>
				<fieldset className="fieldset w-full mt-8">
					<label className="label">Username</label>
					<input
						type="email"
						name="email"
						autoComplete="email"
						className="input w-full"
						value={username ?? ""}
						minLength={2}
						maxLength={16}
						onChange={handleUsernameChange}
					/>
				</fieldset>
			</div>

			<div className="flex-none flex items-center">
				<ProgressDots steps={props.steps} active={props.step} className="mr-auto" />
				<button
					className="btn btn-primary ml-auto"
					disabled={(username?.length ?? 0) < 2 || props.submitting}
					type="submit"
					onClick={handleUIEvent(() => !!username && props.onSubmit(username))}
				>
					{false === props.submitting && (
						<>
							Next <ArrowRightIcon className="size-4" />
						</>
					)}
					{props.submitting && "Submitting..."}
				</button>
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
				<h2 className="text-xl text-primary">Quick access</h2>
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
		const cls = props.active >= i ? "bg-primary" : "bg-gray-100";
		dots.push(<span key={i} className={clsx("inline-block rounded-full h-3 w-3 mr-2", cls)}></span>);
	}

	return <div className={props.className}>{dots}</div>;
}
