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
