import { TokenUtils, useToken } from "~/auth/hooks/useToken";
import { redirect, useNavigate } from "react-router";
import { PageLayout } from "~/components/shared/paged/PageLayout";
import { useMutation } from "@tanstack/react-query";
import { type ChangeEvent, useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { handleUIEvent } from "~/utils/function";
import { patchApi, postApi } from "~/utils/api";
import { useUser } from "~/auth/hooks/useUser";
import { refreshToken } from "~/auth/requests";

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
	const [username, setUsername] = useState<string>();
	const navigate = useNavigate();

	const mutation = useMutation({
		mutationFn: async () => {
			if (!user.data) {
				console.warn("User not defined");
				return;
			}

			await patchApi(`/members/${user.data.id}/onboarding`, { username });
			await refreshToken();
			await user.refetch();
			navigate("/welcome");
		},
	});

	function handleUsernameChange(e: ChangeEvent<HTMLInputElement>) {
		const value = e.target.value
			.trim()
			.replaceAll(/\s+/gi, "_")
			.replaceAll(/[^a-z0-9_]/gi, "");

		setUsername(value.length ? value.substring(0, 16) : undefined);
	}

	return (
		<PageLayout
			title="Select your username"
			action={
				<button
					className="btn btn-primary ml-auto"
					disabled={(username?.length ?? 0) < 2 || mutation.isPending}
					type="submit"
					onClick={handleUIEvent(() => mutation.mutate())}
				>
					{false === mutation.isPending && (
						<>
							Start <ArrowRightIcon className="size-4" />
						</>
					)}
					{mutation.isPending && "Submitting..."}
				</button>
			}
		>
			<div className="h-full flex flex-col justify-center items-center">
				<fieldset className="fieldset w-full">
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
		</PageLayout>
	);
}
