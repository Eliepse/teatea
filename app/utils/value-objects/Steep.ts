import type { Duration, Temperature, Volume } from "./units";

export default class Steep {
	constructor(
		public readonly duration: Duration,
		public readonly temperature: Temperature,
		public readonly water?: Volume,
		public readonly id: number | null = null,
	) {}
}
