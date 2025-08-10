import { CreateTeaFlow } from "~/components/tea/CreateTeaFlow";
import { useNavigate } from "react-router";

export default function TeaCreatePage() {
	const navigate = useNavigate();
	return <CreateTeaFlow onClose={() => navigate("/welcome")} />;
}
