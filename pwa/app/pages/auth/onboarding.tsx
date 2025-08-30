import { TokenUtils, useToken } from "~/auth/hooks/useToken";
import { redirect, useNavigate } from "react-router";
import { PageLayout } from "~/components/shared/paged/PageLayout";
import { useMutation } from "@tanstack/react-query";
import { type ChangeEvent, useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { handleUIEvent } from "~/utils/function";
import { useUser } from "~/auth/hooks/useUser";
import { StackFrame, useNavigationStack } from "~/utils/navigation/useNavigationStack";
import { refreshToken } from "~/auth/requests";
import clsx from "clsx";
import { patchApi } from "~/utils/api";

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
	const { NavigationStack, ...stack } = useNavigationStack({ defaultFrame: { key: "welcome" } });

	const mutation = useMutation({
		mutationFn: async (username: string) => {
			if (!user.data) {
				console.warn("User not defined");
				return;
			}

			await patchApi(`/members/${user.data.id}/onboarding`, { username });
			stack.next({ key: "cta:drink" });
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
				<div className="flex flex-col h-screen p-4">
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
						<ProgressDots steps={3} active={1} className="mr-auto" />
						<button
							className="btn btn-primary"
							onClick={handleUIEvent(() => stack.next({ key: "ask:username" }))}
						>
							Next <ArrowRightIcon className="size-4" />
						</button>
					</div>
				</div>
			</StackFrame>
			<StackFrame frameKey="ask:username">
				<AskUsername submitting={mutation.isPending} onSubmit={(username) => mutation.mutate(username)} />
			</StackFrame>
			<StackFrame frameKey="cta:drink">
				<div className="flex flex-col h-screen p-4">
					<div className="flex-1 flex flex-col justify-center items-start">
						<h2 className="text-xl text-primary">Ready?</h2>
						<p className="max-w-xs mt-6 text-lg">
							Start your journey by adding your first tea drink in your journal.
						</p>

						<button className="btn btn-primary mt-6" onClick={handleUIEvent(() => start("/drink/new"))}>
							Add my first tea session <ArrowRightIcon className="size-4" />
						</button>
					</div>

					<div className="flex-none flex items-center">
						<ProgressDots steps={3} active={3} className="mr-auto" />
						<button className="btn" onClick={handleUIEvent(() => start("/welcome"))}>
							Skip <ArrowRightIcon className="size-4" />
						</button>
					</div>
				</div>
			</StackFrame>
		</NavigationStack>
	);
}

function AskUsername(props: { submitting: boolean; onSubmit: (username: string) => void }) {
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
		<div className="flex flex-col h-screen p-4">
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
				<ProgressDots steps={3} active={2} className="mr-auto" />
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

function ProgressDots(props: { steps: number; active: number; className?: string }) {
	const dots = [];

	for (let i = 1; i <= props.steps; i++) {
		const cls = props.active >= i ? "bg-primary" : "bg-gray-100";
		dots.push(<span className={clsx("inline-block rounded-full h-3 w-3 mr-2", cls)}></span>);
	}

	return <div className={props.className}>{dots}</div>;
}
