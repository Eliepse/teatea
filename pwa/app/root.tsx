import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { Route } from "./+types/root";
import "./app.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AlertContext } from "~/components/shared/modal/AlertManager";
import { StrictMode } from "react";
import { PostHogProvider } from "posthog-js/react";
import type { PostHogConfig } from "posthog-js";

const options: Partial<PostHogConfig> = {
	api_host: import.meta.env.PUBLIC_POSTHOG_HOST as string,
	defaults: "2025-05-24",
	debug: import.meta.env.DEV,
};

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Asap:ital,wght@0,100..900;1,100..900&display=swap",
	},
];

const queryClient = new QueryClient();

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="manifest" href="/manifest.json" />
				<Meta />
				<Links />
			</head>
			<body>
				<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	const children = (
		<AlertContext>
			<Outlet />
		</AlertContext>
	);

	if (options.api_host && import.meta.env.PUBLIC_POSTHOG_KEY) {
		return (
			<StrictMode>
				<PostHogProvider apiKey={import.meta.env.PUBLIC_POSTHOG_KEY} options={options}>
					{children}
				</PostHogProvider>
			</StrictMode>
		);
	}

	return <StrictMode>{children}</StrictMode>;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="pt-16 p-4 container mx-auto">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
