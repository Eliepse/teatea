import { useNavigate } from "react-router";
import { CreateTeaTypeFlow } from "~/components/tea_type/CreateTeaTypeFlow";

export default function TypeCreatePage() {
	const navigate = useNavigate();
	return <CreateTeaTypeFlow onClose={() => navigate("/welcome")} />;
}
