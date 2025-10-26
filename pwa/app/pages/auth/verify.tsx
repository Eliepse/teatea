import type { Route } from "../../../.react-router/types/app/pages/auth/+types/verify";
import axios from "axios";
import { KeyXmark, SecurityPass } from "iconoir-react";
import { LocalStorageUtils } from "~/utils/browser/useLocalStorage";
import { type OTPToken } from "~/auth/components/LoginModal";
import { isFuture } from "date-fns";
import { Link } from "react-router";

export async function clientLoader(args: Route.ComponentProps) {
	const token = args.params.token;
	const OTPToken = LocalStorageUtils.get<OTPToken>("otp_token");

	if (!token) {
		throw new Error("Token missing");
	}

	try {
		await axios.post("/auth/otp/verify", { challenge: token });

		if (null !== OTPToken && isFuture(new Date(OTPToken.expiredAt))) {
			LocalStorageUtils.remove("otp_token");
			return { success: true, localOtp: true };
		}

		return { success: true, localOtp: false };
	} catch (_e) {
		return { success: false, localOtp: false };
	}
}

export default function Verify(args: Route.ComponentProps) {
	const success = args.loaderData.success;
	return (
		<div className="p-6 h-screen flex flex-col justify-center items-center">
			{success && (
				<div className="text-emerald-600 text-center">
					<SecurityPass className="size-14 mx-auto mb-12" />
					<p>
						Verification successful!
						<br />
						Go back to the app to enter your tea journal.
					</p>

					{true === args.loaderData.localOtp && (
						<Link to="/" className="btn btn-outline btn-primary mt-8">
							Go back home
						</Link>
					)}
				</div>
			)}

			{!success && (
				<div className="text-red-500 text-center">
					<KeyXmark className="size-14 mx-auto mb-12" />
					<p>
						Oops... Looks like this verification link is invalid.
						<br />
						Request a new verification link or try login again.
					</p>
				</div>
			)}
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
