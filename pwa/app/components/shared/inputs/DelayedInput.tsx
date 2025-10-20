import {
	type ChangeEvent,
	type DetailedHTMLProps,
	type InputHTMLAttributes,
	useCallback,
	useEffect,
	useState,
} from "react";

const DEFAULT_DELAY_MS = 320;

export function DelayedInput(
	props: Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "onChange"> & {
		delay?: number;
		onChange: (value: string) => void;
	},
) {
	const [bufferValue, setBufferValue] = useState("");

	useEffect(() => {
		const to = setTimeout(() => props.onChange(bufferValue), props.delay ?? DEFAULT_DELAY_MS);
		return () => clearTimeout(to);
	}, [props.onChange, props.delay, bufferValue]);

	const handler = useCallback((e: ChangeEvent<HTMLInputElement>) => setBufferValue(e.currentTarget.value), []);
	return <input {...props} value={bufferValue} onChange={handler} />;
}
