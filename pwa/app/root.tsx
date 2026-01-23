import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { Route } from "./+types/root";
import "./app.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AlertContext } from "~/components/shared/modal/AlertManager";
import { type ReactNode, StrictMode } from "react";
import { PostHogErrorBoundary, PostHogProvider } from "posthog-js/react";
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
		href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,87.5,200..800&family=Commissioner:wght@100..900&display=swap",
	},
];

const queryClient = new QueryClient();

if ("serviceWorker" in navigator) {
	navigator.serviceWorker.register("/sw.js");
}

export let installPrompt: (Event & { prompt: () => Promise<{ outcome: "accepted" | "dismissed" }> }) | undefined =
	undefined;

if (!import.meta.env.SSR) {
	window.addEventListener("beforeinstallprompt", (e) => {
		console.debug("triggered");
		e.preventDefault();
		installPrompt = e as typeof installPrompt;
	});
}

export function Layout({ children }: { children: ReactNode }) {
	return (
		<StrictMode>
			<html lang="en">
				<head>
					<meta charSet="utf-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
					<meta name="robots" content="noindex" />
					<Meta />
					<link rel="manifest" href="/manifest.json" />
					<link rel="icon" href="/favicon.ico" sizes="any" />
					<link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png" />
					<meta name="theme-color" content="#ffffff" />
					<Links />
				</head>
				<body>
					<AlertContext>
						<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
					</AlertContext>
					<ScrollRestoration />
					<Scripts />
				</body>
			</html>
		</StrictMode>
	);
}

export default function App() {
	if (options.api_host && import.meta.env.PUBLIC_POSTHOG_KEY) {
		return (
			<PostHogProvider apiKey={import.meta.env.PUBLIC_POSTHOG_KEY} options={options}>
				<PostHogErrorBoundary fallback={({ error }) => <ErrorBoundary error={error} />}>
					<Outlet />
				</PostHogErrorBoundary>
			</PostHogProvider>
		);
	}

	return <Outlet />;
}

export function ErrorBoundary({ error }: { error: unknown }) {
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
