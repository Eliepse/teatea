import { useState } from "react";
import { QrCode } from "iconoir-react";
import { MemberQRcodeModal } from "~/account/components/MemberQRcodeModal";

export function MemberQRCodeBtn(props: { username: string }) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<button className="btn btn-lg btn-circle bg-white ml-auto shadow-xs" onClick={() => setOpen(true)}>
				<QrCode className="size-5" />
			</button>
			<MemberQRcodeModal open={open} onClose={() => setOpen(false)} username={props.username} />
		</>
	);
}
