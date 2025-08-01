import { Link } from "react-router";

export default function Homepage() {
	return (
		<div className="p-6">
			<Link to="/login">
				<button className="btn btn-block">Login</button>
			</Link>
		</div>
	)
}
