import { useEffect, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { FormattedDuration } from "../shared/FormattedDuration";
import { Duration, Temperature, Volume } from "~/utils/value-objects/units";
import Steep from "~/utils/value-objects/Steep";
import { clamp } from "~/utils/math";

export function SteepForm(props: {
	initDegrees?: Temperature;
	initVolume?: Volume;
	onSubmit?: (steep: Steep) => void;
}) {
	const [startedAt, setStartedAt] = useState<Date | null>(null);
	const [duration, setDuration] = useState<Duration | undefined>();
	const [temperature, setTemperature] = useState<Temperature>(props.initDegrees ?? new Temperature(70));
	const [water, setWater] = useState<Volume | undefined>(props.initVolume);
	const isStarted = null !== startedAt;

	useEffect(() => {
		let af: number | undefined;

		function tick() {
			if (null === startedAt) {
				return;
			}

			const t = Math.floor((new Date().getTime() - startedAt?.getTime()) / 1000);

			if (t !== duration?.totalSeconds) {
				setDuration(Duration.fromSeconds(t));
			}

			af = window.requestAnimationFrame(tick);
		}

		if (null !== startedAt) {
			tick();
		}

		return () => {
			if (undefined !== af) {
				window.cancelAnimationFrame(af);
			}
		};
	}, [startedAt]);

	function start() {
		setStartedAt(new Date());
	}

	function stop() {
		setStartedAt(null);

		if (props.onSubmit && duration) {
			props.onSubmit(new Steep(duration, temperature, water));
		}

		setDuration(undefined);
	}

	function stepChangeTemperature(e: KeyboardEvent) {
		e.stopPropagation();

		if ("ArrowDown" === e.key) {
			setTemperature((t) => new Temperature(Math.abs(t.deg - 5)));
		}

		if ("ArrowUp" === e.key) {
			setTemperature((t) => new Temperature(Math.abs(t.deg + 5)));
		}
	}

	function stepChangeWaterVolume(e: KeyboardEvent) {
		e.stopPropagation();

		if ("ArrowDown" === e.key) {
			setWater((v) => Volume.fromMl(Math.abs((v?.ml ?? 100) - 10)));
		}

		if ("ArrowUp" === e.key) {
			setWater((v) => Volume.fromMl(Math.abs((v?.ml ?? 100) + 10)));
		}
	}

	function handleTemperatureInputChange(e: ChangeEvent<HTMLInputElement>) {
		const cleanValue = e.currentTarget.value.replaceAll(/[^0-9]/g, "");
		setTemperature(new Temperature(clamp(0, parseInt(cleanValue || "0"), 100)));
	}

	function handleWaterInputChange(e: ChangeEvent<HTMLInputElement>) {
		const cleanValue = e.currentTarget.value.replaceAll(/[^0-9]/g, "");
		const value = parseInt(cleanValue || "0");
		setWater(!value ? undefined : Volume.fromMl(Math.min(0, value)));
	}

	return (
		<div className="px-2 py-3">
			<div className="text-3xl text-center font-mono mb-8">
				<FormattedDuration duration={duration ?? new Duration(0)} />
			</div>

			<div className="px-8 flex mb-10 justify-center">
				{isStarted ? (
					<span className="mx-4">{temperature.deg} °C</span>
				) : (
					<label className="input mr-4 max-w-[10rem]">
						<input
							value={temperature.deg}
							onChange={handleTemperatureInputChange}
							onKeyDown={stepChangeTemperature}
							type="text"
							pattern="[0-9]{1,2}"
						/>
						<span className="label">°C</span>
					</label>
				)}

				{isStarted ? (
					<span className="mx-4">{water?.ml || "-"} ml</span>
				) : (
					<label className="input max-w-[10rem]">
						<input
							value={water?.ml ?? ""}
							onChange={handleWaterInputChange}
							onKeyDown={stepChangeWaterVolume}
							type="text"
							pattern="[0-9]+"
						/>
						<span className="label">ml</span>
					</label>
				)}
			</div>

			{!duration && null === startedAt && (
				<button className="btn btn-outline btn-block mx-auto" onClick={start}>
					Start
				</button>
			)}

			{null !== startedAt && !!duration && (
				<>
					<button className="btn btn-block btn-neutral" onClick={stop}>
						Stop
					</button>
				</>
			)}
		</div>
	);
}
