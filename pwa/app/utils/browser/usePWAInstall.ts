import { useState } from "react";

export let installPrompt: (Event & { prompt: () => Promise<{ outcome: "accepted" | "dismissed" }> }) | undefined =
	undefined;

if (!import.meta.env.SSR) {
	window.addEventListener("beforeinstallprompt", (e) => {
		e.preventDefault();
		installPrompt = e as typeof installPrompt;
	});
}

function getPWADisplayMode() {
	if (document.referrer.startsWith("android-app://")) return "twa";
	if (window.matchMedia("(display-mode: browser)").matches) return "browser";
	if (window.matchMedia("(display-mode: standalone)").matches || navigator.standalone) return "standalone";
	if (window.matchMedia("(display-mode: minimal-ui)").matches) return "minimal-ui";
	if (window.matchMedia("(display-mode: fullscreen)").matches) return "fullscreen";
	if (window.matchMedia("(display-mode: window-controls-overlay)").matches) return "window-controls-overlay";
	return "unknown";
}

export function usePWAInstall() {
	const displayMode = getPWADisplayMode();
	const isInPWA = false === ["browser", "unknown"].includes(displayMode);
	const [isInstalled, setIsInstalled] = useState(import.meta.env.SSR ? true : isInPWA);

	async function prompt() {
		if (isInstalled || !installPrompt) {
			return;
		}

		const result = await installPrompt.prompt();

		if ("dismissed" === result.outcome) {
			return;
		}

		installPrompt = undefined;
		setIsInstalled(true);
	}

	return { prompt, installable: !isInstalled && !!installPrompt };
}
