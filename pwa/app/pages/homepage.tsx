import { useNavigate } from "react-router";
import { TokenUtils, useToken } from "~/auth/hooks/useToken";
import type { Route } from "../../.react-router/types/app/pages/+types/homepage";
import { LoginModal } from "~/auth/components/LoginModal";
import { useState } from "react";

export async function clientLoader() {
	return {
		isAuth: null !== TokenUtils.getRefreshToken(),
	};
}

export default function Homepage(props: Route.ComponentProps) {
	const [token] = useToken();
	const navigate = useNavigate();
	const [loginModal, setLoginModal] = useState(false);

	function openJournal() {
		if (token) {
			navigate("/welcome");
			return;
		}

		setLoginModal(true);
	}

	return (
		<div className="p-8 flex flex-col h-screen bg-[url(img/tea-tree-leaves-field.jpg)] bg-cover">
			<div className="flex-1 flex flex-col justify-center text-center text-green-50">
				<h1 className="text-8xl font-bold font-serif mb-6" style={{ transform: "translateX(-.06em)" }}>
					teatea
				</h1>
				<p className="text-xl mx-auto opacity-80">Your personal tea journal</p>
			</div>

			<div className="mt-8">
				<button className="btn btn-lg btn-block" onClick={openJournal}>
					Open my tea journal
				</button>
				<p className="mt-4 text-xs text-white text-center">This app is currently in development</p>
			</div>

			<LoginModal open={loginModal} onClose={() => setLoginModal(false)} />
		</div>
	);
}
