export class Duration {
	constructor(private readonly _totalSeconds: number) {}

	get hours(): number {
		return Math.floor(this._totalSeconds / 3_600);
	}

	get minutes(): number {
		return Math.floor((this._totalSeconds % 3_600) / 60);
	}

	get seconds(): number {
		return (this._totalSeconds % 3_600) % 60;
	}

	get totalSeconds(): number {
		return this._totalSeconds;
	}

	get totalMinutes(): number {
		return this._totalSeconds / 60;
	}

	get totalHours(): number {
		return this._totalSeconds / 3_600;
	}

	static fromSeconds(seconds: number): Duration {
		return new Duration(seconds);
	}
}

export class Temperature {
	constructor(public readonly degrees: number) {}

	get deg() {
		return this.degrees;
	}
}

export class Volume {
	constructor(public readonly liters: number) {}

	get ml() {
		return this.liters * 1_000;
	}

	static fromMl(ml: number): Volume {
		return new Volume(ml / 1_000);
	}
}

export class Weight {
	constructor(public readonly kilograms: number) {}

	get g() {
		return this.kilograms * 1_000;
	}

	static fromG(g: number): Weight {
		return new Weight(g / 1_000);
	}
}
