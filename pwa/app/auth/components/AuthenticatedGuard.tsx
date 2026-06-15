import { AuthProvider } from "~/auth/hooks/useAuth";
import { Outlet } from "react-router";
import type { Route } from "../../../.react-router/types/app/auth/components/+types/AuthenticatedGuard";
import { authMiddleware } from "~/auth/authMiddleware";

export const clientMiddleware: Route.ClientMiddlewareFunction[] = [authMiddleware];

export default function AuthenticatedGuard() {
	return (
		<AuthProvider>
			<Outlet />
		</AuthProvider>
	);
}
