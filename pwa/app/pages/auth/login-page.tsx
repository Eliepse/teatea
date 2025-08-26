import { redirect, useFetcher } from "react-router";
import type { Route } from "../../../.react-router/types/app/pages/auth/+types/login-page";
import { TokenUtils } from "~/auth/hooks/useToken";
import { handleUIEvent } from "~/utils/function";

type OTPResponse =
	| {
			token: string;
			refresh_token: string;
			refresh_token_expiration: number;
	  }
	| {
			action: { redirect: string };
			message?: string;
	  };

export async function clientAction({ request }: Route.ClientActionArgs) {
	const formData = await request.formData();
	const email = formData.get("email");

	if (typeof email !== "string") {
		return false;
	}

	await fetch("/auth/login", {
		method: "POST",
		body: JSON.stringify({ email }),
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
	});

	return { success: true };
}

export async function clientLoader(props: Route.ClientLoaderArgs) {
	if (null !== TokenUtils.getRefreshToken()) {
		throw redirect("/welcome");
	}

	const otpToken = props.params.token;

	if (!otpToken) {
		return;
	}

	const response = await fetch(`/auth/otp/${otpToken}`, { method: "POST", headers: { Accept: "application/json" } });
	const data = (await response.json()) as Partial<OTPResponse>;

	if ("action" in data) {
		return { message: data.message };
	}

	if ("token" in data && data.token && data.refresh_token && data.refresh_token_expiration) {
		TokenUtils.set(data.token);
		TokenUtils.setRefreshToken(data.refresh_token, new Date(data.refresh_token_expiration * 1_000));
		throw redirect("/welcome");
	}

	throw new Error("Invalid auth response");
}

export default function LoginPage(args: Route.ComponentProps) {
	const fetcher = useFetcher();

	if (true === fetcher.data?.success) {
		return (
			<div className="p-6 text-center h-screen flex flex-col justify-center items-center">
				<p className="mb-4">
					Please check you emails, if you have an account you should have received an email
				</p>
				<button className="btn btn-link" onClick={handleUIEvent(() => window.location.reload())}>
					Try another email
				</button>
			</div>
		);
	}

	return (
		<div className="p-6 h-screen flex flex-col justify-center items-center">
			{!!args.loaderData?.message && (
				<div role="alert" className="alert alert-error text-white w-full mb-4">
					{args.loaderData.message}
				</div>
			)}

			<fetcher.Form method="POST" className="max-w-xs w-full">
				<fieldset className="fieldset mb-2">
					<legend className="fieldset-legend">Email</legend>
					<input type="email" name="email" autoComplete="email" className="input w-full" />
				</fieldset>

				<button className="btn btn-primary btn-block" disabled={"idle" !== fetcher.state} type="submit">
					Enter
				</button>
			</fetcher.Form>
		</div>
	);
}

export function HydrateFallback() {
	return (
		<div className="w-screen h-screen flex items-center justify-center">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
				className="size-8 animate-spin opacity-70"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
				/>
			</svg>
		</div>
	);
}
