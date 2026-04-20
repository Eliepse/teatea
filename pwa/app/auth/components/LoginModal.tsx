import { Modal } from "~/components/shared/modal/Modal";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { differenceInMilliseconds } from "date-fns";
import { LocalStorageUtils } from "~/utils/browser/useLocalStorage";
import { useAlert } from "~/components/shared/modal/AlertManager";
import { SecurityPass, TimerOff } from "iconoir-react";
import { Link, useNavigate } from "react-router";
import axios, { AxiosError } from "axios";
import { attemptOTPLogin } from "~/auth/requests";
import { useToken } from "~/auth/hooks/useToken";
import { usePostHog } from "@posthog/react";
import { loginDevMode } from "~/auth/query/loginQuery";

export type OTPToken = { value: string; expiredAt: Date };
type OTPResponse =
	| {
			token: string;
			refresh_token: string;
			refresh_token_expiration: number;
	  }
	| {
			message?: string;
	  };

export function LoginModal(props: { open: boolean; onClose: () => void }) {
	const defaultEmail = useRef("");
	const alert = useAlert();
	const [token] = useToken();
	const [OTPToken, setOTPToken] = useState<OTPToken | boolean | null>(LocalStorageUtils.get<OTPToken>("otp_token"));

	useQuery({
		queryFn: async (ctx) => {
			const token = ctx.queryKey[0];

			if (null === token || typeof token !== "object") {
				return null;
			}

			try {
				if (await attemptOTPLogin(token)) {
					setOTPToken(true);
				} else {
					setOTPToken(false);
				}
			} catch (e) {
				if (e instanceof AxiosError && e.status === 403) {
					throw new Error();
				}

				alert({ title: "Verification failed" });
				setOTPToken(false);
				return null;
			}

			return null;
		},
		queryKey: [OTPToken],
		enabled: null !== OTPToken && typeof OTPToken === "object" && props.open,
		retryDelay: 3_000,
		retry: true,
		refetchOnWindowFocus: true,
	});

	useEffect(() => {
		if (null === OTPToken || typeof OTPToken !== "object") {
			return;
		}

		// Refresh the view to display the "token expired" screen
		const ttl = differenceInMilliseconds(OTPToken.expiredAt, new Date());
		const to = setTimeout(() => {
			LocalStorageUtils.remove("otp_token");
			setOTPToken(false); // Force rerender
		}, ttl);
		return () => clearTimeout(to);
	}, [OTPToken]);

	function handleLoggedInToken(token: OTPToken) {
		LocalStorageUtils.store("otp_token", token);
		setOTPToken(token);
	}

	return (
		<Modal onClose={props.onClose} open={props.open} className="p-4">
			{null === token && null === OTPToken && (
				<LoginForm
					defaultEmail={defaultEmail.current}
					onEmailChange={(v) => (defaultEmail.current = v)}
					onLoggedIn={handleLoggedInToken}
				/>
			)}
			{null === token && null !== OTPToken && typeof OTPToken === "object" && (
				<WaitView onCancel={() => setOTPToken(null)} />
			)}
			{null === token && false === OTPToken && <ExpiredView onCancel={() => setOTPToken(null)} />}
			{(!!token || true === OTPToken) && <SuccessView />}
		</Modal>
	);
}

function ExpiredView(props: { onCancel: () => void }) {
	return (
		<div className="text-center">
			<TimerOff className="mx-auto size-12 text-red-500" />
			<h2 className="text-lg my-6 text-red-500">Oops, verification expired!</h2>
			<button className="btn btn-lg btn-block" onClick={props.onCancel}>
				Retry
			</button>
		</div>
	);
}

function SuccessView() {
	return (
		<div className="text-center pt-2">
			<SecurityPass className="mx-auto size-12 text-emerald-500" />
			<h2 className="text-lg my-6 text-emerald-500">Successfully verified!</h2>
			<Link to="/welcome" className="btn btn-lg btn-block btn-primary">
				Open my tea journal
			</Link>
		</div>
	);
}

function WaitView(props: { onCancel: () => void }) {
	// const { isPending, mutate } = useMutation({
	// 	mutationFn: async (email: string) => {
	// 		const response = await axios.post<{ token: string; expiredAt: string }>("/auth/otp/resend", { challenge: token });
	// 		return response.data;
	// 	},
	// 	onSuccess: (payload) => {
	// 		const token: OTPToken = { value: payload.token, expiredAt: new Date(payload.expiredAt) };
	// 		props.onLoggedIn(token);
	// 	},
	// 	onError: (e) => alert({ body: e.message }),
	// });

	return (
		<div className="text-center pt-2">
			<span className="loading loading-ring text-success w-24" />

			<h2 className="text-center text-lg my-6">
				Waiting for email verification,
				<br />
				check your inbox
			</h2>
			<p className="text-teal-700 text-sm mb-4">
				If you have an account registered with the email address provided, you received an email with a
				verification link.
			</p>

			<hr className="my-4 text-teal-100" />

			<h3 className="mb-4">Still haven't received the verification email?</h3>

			{/*<button onClick={props.onCancel} className="btn btn-soft btn-wide mb-2">*/}
			{/*	Send a new verification email*/}
			{/*</button>*/}

			<button onClick={props.onCancel} className="btn btn-soft btn-wide">
				Try with another email
			</button>
		</div>
	);
}

function LoginForm(props: {
	defaultEmail: string;
	onEmailChange: (email: string) => void;
	onLoggedIn: (token: OTPToken) => void;
}) {
	const alert = useAlert();
	const [email, setEmail] = useState("");
	const posthog = usePostHog();
	const navigate = useNavigate();

	const isEmailValid = 3 < email.length && email.includes("@");

	const { isPending, mutate } = useMutation({
		mutationFn: async (email: string) => {
			const response = await axios.post<{ token: string; expiredAt: string }>("/auth/login", { email });
			return response.data;
		},
		onSuccess: (payload) => {
			const token: OTPToken = { value: payload.token, expiredAt: new Date(payload.expiredAt) };
			props.onLoggedIn(token);
		},
		onError: (e) => alert({ body: e.message }),
	});

	function submit() {
		if (!isEmailValid) {
			return;
		}

		posthog?.capture("user_requested_otp", { email });
		mutate(email);
	}

	function submitDevMode() {
		void loginDevMode(runtimeEnv.DEV_LOGIN_KEY);
		navigate("/welcome");
	}

	return (
		<div>
			<h2 className="text-center text-lg mb-6">Login to your journal</h2>

			<fieldset className="fieldset mb-4">
				<label className="fieldset-label">Email</label>
				<input
					type="email"
					inputMode="email"
					name="email"
					autoComplete="email"
					className="input input-lg w-auto"
					placeholder="tealover@mailer.com"
					value={email}
					onChange={(e) => setEmail(e.currentTarget.value)}
					disabled={isPending}
					onKeyDown={(e) => e.key === "Enter" && submit()}
				/>
			</fieldset>

			<button className="btn btn-lg btn-block btn-primary" onClick={submit} disabled={!isEmailValid || isPending}>
				Enter
			</button>

			{import.meta.env.DEV && (
				<button className="btn btn-block btn-ghost mt-2" onClick={submitDevMode}>
					Dev mode
				</button>
			)}

			<hr className="my-8 border-teal-100" />

			<h2 className="text-lg mb-2">New member</h2>
			<p className="text-teal-600">
				For now, <i>teatea</i> is on invitation only. You'll be able to request an invitation soon!
			</p>
		</div>
	);
}
