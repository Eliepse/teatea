import { useNavigationStack } from "~/utils/navigation/useNavigationStack";
import { createContext, useState } from "react";
import { SelectTeaFrame } from "~/components/stackFrames/SelectTeaFrame";
import type { Tea } from "~t/types";
import { useNavigate, useNavigation } from "react-router";

type FormData = {
	tea?: Tea;
};

const newSipContext = createContext({});

export default function LogSipPage() {
	const navigate = useNavigate()
	const navigationStack = useNavigationStack({ key: "tea" });
	const [formData, setFormData] = useState<FormData>({});

	function backOrFallback() {
		if(1 === navigationStack.stack.length) {
			navigate(-1);
			return;
		}

		navigationStack.back()
	}

	function updateForm(part: Partial<typeof formData>) {
		setFormData((f) => ({ ...f, ...part }));
	}

	return (
		<newSipContext.Provider value={{}}>
			{navigationStack.isFrame("tea") && (
				<SelectTeaFrame onBack={backOrFallback} onSelect={(tea) => updateForm({ tea })} value={formData.tea} />
			)}
		</newSipContext.Provider>
	);
}
