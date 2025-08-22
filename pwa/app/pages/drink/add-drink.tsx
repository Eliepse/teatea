import { useNavigate } from "react-router";
import { CreateDrinkFlow } from "~/components/drink/CreateDrinkFlow";

export default function LogDrinkPage() {
	const navigate = useNavigate();
	return <CreateDrinkFlow onBack={() => navigate(-1)} />;
}
