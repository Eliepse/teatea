declare global {
	var runtimeEnv: RuntimeEnv;
}

export type RuntimeEnv = {
	VITE_API_URL: string;
	VITE_SUPPORT_EMAIL: string;
	VITE_POSTHOG_KEY?: string;
	VITE_POSTHOG_HOST?: string;
	VITE_DEV_LOGIN_KEY?: string;
	VITE_BASE_URL: string;
};
