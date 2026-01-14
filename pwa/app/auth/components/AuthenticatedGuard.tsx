import { AuthProvider } from "~/auth/hooks/useAuth";
import { Outlet } from "react-router";
import { Leaf } from "iconoir-react";
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

export function HydrateFallback() {
	return (
		<div className="w-screen h-screen flex items-center justify-center bg-green-50">
			<Leaf className="size-8 animate-spin text-green-700" />
		</div>
	);
}
