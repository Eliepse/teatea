import { AuthProvider } from "~/auth/hooks/useAuth";
import { Outlet, redirect, useNavigate } from "react-router";
import { TokenUtils } from "~/auth/hooks/useToken";
import { refreshToken } from "~/auth/requests";
import { Leaf } from "iconoir-react";

export async function clientLoader() {
	if (null === TokenUtils.get()) {
		try {
			await refreshToken();
		} catch (e) {
			console.error(e);
			throw redirect("/");
		}
	}

	const token = TokenUtils.get();

	if (!token) {
		throw redirect("/");
	}

	if (false === token.roles.includes("ROLE_USER") || token.roles.includes("ROLE_ONBOARDING")) {
		throw redirect("/onboarding");
	}
}

export default function AuthenticatedGuard() {
	const token = TokenUtils.get();
	const navigate = useNavigate();

	if (null === token) {
		navigate("/");
		return null;
	}

	return (
		<AuthProvider>
			<Outlet />
		</AuthProvider>
	);
}

export function HydrateFallback() {
	return (
		<div className="w-screen h-screen flex items-center justify-center bg-green-50">
			<Leaf className="size-8 animate-spin text-green-700" />
		</div>
	);
}
