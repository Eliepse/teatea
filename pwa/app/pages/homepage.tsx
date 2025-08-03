import { Link } from "react-router";
import { TokenUtils } from "~/auth/hooks/useToken";
import type { Route } from "../../.react-router/types/app/pages/+types/homepage";

export async function clientLoader() {
	return {
		isAuth: null !== TokenUtils.get(),
	};
}

export default function Homepage(props: Route.ComponentProps) {
	return (
		<div className="p-6">
			{props.loaderData.isAuth ? (
				<Link to="/welcome">
					<button className="btn btn-block">Dashboard</button>
				</Link>
			) : (
				<Link to="/login">
					<button className="btn btn-block">Login</button>
				</Link>
			)}
		</div>
	);
}
