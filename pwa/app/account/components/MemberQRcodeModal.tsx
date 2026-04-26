import { Modal } from "~/components/shared/modal/Modal";
import { useCallback } from "react";
import QRCode from "qrcode";

export function MemberQRcodeModal(props: { open: boolean; onClose: () => void; username: string }) {
	const canvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
		if (!canvas) {
			return;
		}

		QRCode.toCanvas(
			canvas,
			`${runtimeEnv.VITE_BASE_URL}/m/${props.username}`,
			{
				errorCorrectionLevel: "low",
				version: 3,
				scale: 5,
				margin: 0,
				color: { light: "#ffffff00", dark: "#14532d" },
			},
			function (error) {
				if (error) console.error(error);
			},
		);
	}, []);

	return (
		<Modal open={props.open} onClose={props.onClose} className="px-4 py-8 text-center">
			<canvas className="mx-auto mb-8" ref={canvasRef} width={165} height={165}></canvas>

			<a className="text-sm">
				{runtimeEnv.VITE_BASE_URL}/m/{props.username}
			</a>
		</Modal>
	);
}
