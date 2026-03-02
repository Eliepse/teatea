import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import posthog from "posthog-js";
import { PostHogErrorBoundary, PostHogProvider } from "@posthog/react";
import { isRouteErrorResponse } from "react-router";

startTransition(() => {
	if (runtimeEnv.POSTHOG_HOST && runtimeEnv.POSTHOG_KEY) {
		posthog.init(runtimeEnv.POSTHOG_KEY as string, {
			api_host: runtimeEnv.POSTHOG_HOST as string,
			defaults: "2026-01-30",
			__add_tracing_headers: [window.location.host, "localhost"], // TODO(elie): add real host on prod
			debug: import.meta.env.DEV,
			autocapture: false,
		});

		hydrateRoot(
			document,
			<PostHogProvider client={posthog}>
				<PostHogErrorBoundary fallback={({ error }) => <ErrorBoundary error={error} />}>
					<StrictMode>
						<HydratedRouter />
					</StrictMode>
				</PostHogErrorBoundary>
			</PostHogProvider>,
		);

		return;
	}

	hydrateRoot(
		document,
		<StrictMode>
			<HydratedRouter />
		</StrictMode>,
	);
});

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
