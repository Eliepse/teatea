import { redirect, useFetcher } from "react-router";
import type { Route } from "../../../.react-router/types/app/pages/auth/+types/login-page";
import { TokenUtils } from "~/auth/hooks/useToken";
import { login } from "~/auth/requests";

export async function clientAction({ request }: Route.ClientActionArgs) {
	const formData = await request.formData();
	const email = formData.get("email");
	const password = formData.get("password");

	if (typeof email !== "string" || typeof password !== "string") {
		return false;
	}

	return !!(await login(email, password));
}

export function clientLoader() {
	if (null !== TokenUtils.get()) {
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
