import { NavigationStack, StackFrame, useNavigationStack } from "~/utils/navigation/useNavigationStack";
import { createContext, useState } from "react";
import { SelectTeaFrame } from "~/components/stackFrames/SelectTeaFrame";
import type { Tea } from "~t/types";
import { useNavigate } from "react-router";

type FormData = {
	tea?: Tea;
};

const newSipContext = createContext({});

export default function LogSipPage() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState<FormData>({});

	function updateForm(part: Partial<typeof formData>) {
		setFormData((f) => ({ ...f, ...part }));
	}

	return (
		<NavigationStack defaultFrame={{ key: "tea" }} onOverBack={() => navigate(-1)}>
			<newSipContext.Provider value={{}}>
				<StackFrame frameKey="tea">
					<SelectTeaFrame onSelect={(tea) => updateForm({ tea })} value={formData.tea} />
				</StackFrame>
			</newSipContext.Provider>
		</NavigationStack>
	);
}
