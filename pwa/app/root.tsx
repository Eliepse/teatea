import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { Route } from "./+types/root";
import "./app.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AlertContext } from "~/components/shared/modal/AlertManager";
import { type ReactNode, StrictMode, useState } from "react";

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
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 10_000,
					},
				},
			}),
	);

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
					<script src="/client/pwa-support.js"></script>
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

export function HydrateFallback() {
	return (
		<div className="w-screen h-screen flex items-center justify-center bg-green-50">
			<svg
				width="24px"
				height="24px"
				viewBox="0 0 24 24"
				strokeWidth="1.5"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				color="currentColor"
				className="size-8 animate-spin text-green-700"
			>
				<path
					d="M7 21C7 21 7.5 16.5 11 12.5"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				></path>
				<path
					d="M19.1297 4.24224L19.7243 10.4167C20.0984 14.3026 17.1849 17.7626 13.2989 18.1367C9.486 18.5039 6.03191 15.7168 5.66477 11.9039C5.29763 8.09099 8.09098 4.70237 11.9039 4.33523L18.475 3.70251C18.8048 3.67074 19.098 3.91239 19.1297 4.24224Z"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				></path>
			</svg>
		</div>
	);
}

export default function App() {
	return <Outlet />;
}
