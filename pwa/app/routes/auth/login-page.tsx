import { redirect, useFetcher, useNavigate } from "react-router";
import type { Route } from "../../../.react-router/types/app/routes/auth/+types/login-page";
import { wait } from "~/utils/time";
import { LocalStorageUtils } from "~/utils/browser/useLocalStorage";
import { useAuth } from "~/auth/hooks/useAuth";
import { isLoggedIn } from "~/auth/auth";

export async function clientAction({ request }: Route.ClientActionArgs) {
	const formData = await request.formData();
	const email = formData.get("email");
	const password = formData.get("password");

	await wait(500);

	const response = await fetch("/auth", {
		method: "POST",
		body: JSON.stringify({ email, password }),
		headers: {
			"Content-Type": "application/ld+json",
			Accept: "application/ld+json",
		},
	});

	const data = await response.json();

	if (data.token) {
		LocalStorageUtils.store("token", data.token);
		return redirect("/welcome");
	}

	return null;
}

export function clientLoader() {
	if (isLoggedIn()) {
		throw redirect("/welcome");
	}
}

export default function LoginPage(args: Route.ComponentProps) {
	const fetcher = useFetcher();

	return (
		<div className="p-6">
			<fetcher.Form method="POST" className="max-w-xs mx-auto">
				<fieldset className="fieldset mb-2">
					<legend className="fieldset-legend">Email</legend>
					<input type="email" name="email" autoComplete="email" className="input w-full" />
				</fieldset>

				<fieldset className="fieldset mb-6">
					<legend className="fieldset-legend">Password</legend>
					<input type="password" name="password" autoComplete="current-password" className="input w-full" />
				</fieldset>

				<button className="btn btn-primary btn-block" disabled={"idle" !== fetcher.state} type="submit">
					Enter
				</button>
			</fetcher.Form>
		</div>
	);
}
