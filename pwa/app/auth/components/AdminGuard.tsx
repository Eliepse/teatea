import { AuthProvider } from "~/auth/hooks/useAuth";
import { Outlet, redirect, useNavigate } from "react-router";
import { TokenUtils } from "~/auth/hooks/useToken";
import { refreshToken } from "~/auth/requests";

export async function clientLoader() {
	let token = TokenUtils.get();

	if(null === token) {
		try {
			await refreshToken();
			token = TokenUtils.get();
		} catch (e) {
			console.error(e);
			throw redirect("/");
		}
	}

	if (null !== token && token.roles.includes("ROLE_ADMIN")) {
		return;
	}

	throw redirect("/");
}

export default function AdminGuard() {
	const token = TokenUtils.get();
	const navigate = useNavigate();

	if (null === token || false === token.roles.includes("ROLE_ADMIN")) {
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
		<div className="w-screen  h-screen flex items-center justify-center">
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
