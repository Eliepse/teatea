import type { Route } from "../../../.react-router/types/app/pages/auth/+types/login";
import axios from "axios";

type OTPResponse =
	| {
			token: string;
			refresh_token: string;
			refresh_token_expiration: number;
	  }
	| {
			action: { redirect: string };
			message?: string;
	  };

export async function clientLoader(args: Route.ComponentProps) {
	const token = args.params.token;

	if (!token) {
		throw new Error("Token missing");
	}

	try {
		await axios.post("/auth/otp/verify", { challenge: token });
		return { success: true };
	} catch (_e) {
		return { success: false };
	}
}

export default function Login(args: Route.ComponentProps) {
	return (
		<div className="p-6 h-screen flex flex-col justify-center items-center">
			{true === args.loaderData.success && <div>Success !</div>}
			{false === args.loaderData.success && <div>Failure...</div>}
		</div>
	);
}

export function HydrateFallback() {
	return (
		<div className="w-screen h-screen flex items-center justify-center">
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
