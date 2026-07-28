import { useNavigate } from "react-router";
import { useToken } from "~/auth/hooks/useToken";
import { LoginModal } from "~/auth/components/LoginModal";
import { useState } from "react";
import { Logo } from "~/components/icons/Logo";

// Force the page to be client side rendered
export async function clientLoader() {}

export default function Homepage() {
	const [token] = useToken();
	const navigate = useNavigate();
	const [loginModal, setLoginModal] = useState(false);

	function openJournal() {
		if (token) {
			navigate("/feed");
			return;
		}

		setLoginModal(true);
	}

	return (
		<div className="p-8 flex flex-col h-dvh bg-[url(/img/tea-tree-leaves-field.jpg)] bg-cover">
			<div className="flex-1 flex flex-col justify-center text-center text-green-50">
				<Logo className="w-76 mx-auto text-white mb-8" style={{ transform: "translateX(-1%)" }} />
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
