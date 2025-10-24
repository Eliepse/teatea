import { Modal } from "~/components/shared/modal/Modal";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { differenceInMilliseconds } from "date-fns";
import { LocalStorageUtils } from "~/utils/browser/useLocalStorage";
import { useAlert } from "~/components/shared/modal/AlertManager";
import { SecurityPass, TimerOff } from "iconoir-react";
import { Link } from "react-router";
import axios from "axios";
import { TokenUtils } from "~/auth/hooks/useToken";

type OTPToken = { value: string; expiredAt: Date };
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
	const [token, setToken] = useState<OTPToken | boolean | null>(LocalStorageUtils.get<OTPToken>("otp_token"));

	const pollingValidator = useQuery({
		queryFn: async (ctx) => {
			const token = ctx.queryKey[0];

			if (null === token || typeof token !== "object") {
				return null;
			}

			const data = (await axios.post<OTPResponse>("/auth/otp", { challenge: token.value })).data;

			if ("token" in data) {
				TokenUtils.set(data.token);
				TokenUtils.setRefreshToken(data.refresh_token, new Date(data.refresh_token_expiration * 1_000));
				setToken(true);
				return null;
			}

			if ("message" in data) {
				alert({ title: "Verification failed", body: data.message });
				LocalStorageUtils.remove("otp_token");
				setToken(false);
				throw new Error("Validation failed");
			}

			return null;
		},
		queryKey: [token],
		enabled: null !== token && typeof token === "object" && props.open,
		retryDelay: 6_000,
		retry: true,
		refetchOnWindowFocus: true,
	});

	useEffect(() => {
		if (null === token || typeof token !== "object") {
			return;
		}

		// Refresh the view to display the "token expired" screen
		const ttl = differenceInMilliseconds(token.expiredAt, new Date());
		const to = setTimeout(() => {
			LocalStorageUtils.remove("otp_token");
			setToken(false); // Force rerender
		}, ttl);
		return () => clearTimeout(to);
	}, [token]);

	function handleLoggedInToken(token: OTPToken) {
		LocalStorageUtils.store("otp_token", token);
		setToken(token);
	}

	return (
		<Modal onClose={props.onClose} open={props.open} position="bottom">
			{null === token && (
				<LoginForm
					defaultEmail={defaultEmail.current}
					onEmailChange={(v) => (defaultEmail.current = v)}
					onLoggedIn={handleLoggedInToken}
				/>
			)}
			{null !== token && typeof token === "object" && <WaitView onCancel={() => setToken(null)} />}
			{false === token && <ExpiredView onCancel={() => setToken(null)} />}
			{true === token && <SuccessView />}
		</Modal>
	);
}

function ExpiredView(props: { onCancel: () => void }) {
	return (
		<div className="text-center">
			<TimerOff className="mx-auto size-12 text-red-500" />
			<h2 className="text-lg my-6 text-red-500">Oops, verification expired!</h2>
			<button className="btn btn-lg btn-block" onClick={props.onCancel}>
				Retry with another email
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

	return (
		<div>
			<h2 className="text-center text-lg mb-6">Login to your journal</h2>

			<fieldset className="fieldset mb-4">
				<label className="fieldset-label">Email</label>
				<input
					type="email"
					inputMode="email"
					className="input input-lg w-auto"
					placeholder="tealover@mailer.com"
					value={email}
					onChange={(e) => setEmail(e.currentTarget.value)}
					disabled={isPending}
				/>
			</fieldset>

			<button
				className="btn btn-lg btn-block btn-primary"
				onClick={() => mutate(email)}
				disabled={!isEmailValid || isPending}
			>
				Enter
			</button>

			<hr className="my-8 border-teal-100" />

			<h2 className="text-lg mb-2">New member</h2>
			<p className="text-teal-600">
				For now, <i>teatea</i> is on invitation only. You'll be able to request an invitation soon!
			</p>
		</div>
	);
}
