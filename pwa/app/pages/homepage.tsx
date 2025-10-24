import { Link } from "react-router";
import { TokenUtils, useToken } from "~/auth/hooks/useToken";
import type { Route } from "../../.react-router/types/app/pages/+types/homepage";

export async function clientLoader() {
	return {
		isAuth: null !== TokenUtils.getRefreshToken(),
	};
}

export default function Homepage(props: Route.ComponentProps) {
	const [token] = useToken();

	return (
		<div className="p-8 flex flex-col h-screen bg-[url(img/tea-tree-leaves-field.jpg)] bg-cover">
			<div className="flex-1 flex flex-col justify-center text-center text-green-50">
				<h1 className="text-7xl font-bold font-serif mb-6">teatea</h1>
				<p className="text-lg max-w-xs mx-auto">Your personal tea journal</p>
			</div>

			<div className="mt-8">
				<Link to={token ? "/welcome" : "/login"} className="btn btn-lg btn-block">
					Open my tea journal
				</Link>
				<p className="mt-4 text-xs text-white text-center">This app is currently in development</p>
			</div>
		</div>
	);
}
